import { supabase } from './supabaseClient';
import { ResumeAnalysis, ResumeAnalysisData } from '../types';
import { analyzeResume, generateResumeSuggestions } from './geminiService';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ============================================================================
// RESUME FILE HANDLING
// ============================================================================

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF. Please ensure it\'s a valid PDF file.');
  }
}

/**
 * Extract text from DOCX file (simplified - just reads as text)
 * For production, consider using mammoth.js or similar library
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX. Please try converting to PDF.');
  }
}

/**
 * Extract text from resume file based on format
 */
export async function extractResumeText(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return file.text();
  } else {
    throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
  }
}

// ============================================================================
// SUPABASE STORAGE
// ============================================================================

/**
 * Upload resume file to Supabase Storage
 */
export async function uploadResumeToStorage(
  file: File,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading resume:', error);
    throw new Error('Failed to upload resume file');
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

/**
 * Delete resume file from Supabase Storage
 */
export async function deleteResumeFromStorage(resumeUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(resumeUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // Get userId/timestamp.ext
    
    await supabase.storage
      .from('resumes')
      .remove([fileName]);
  } catch (error) {
    console.error('Error deleting resume:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Save resume analysis to database
 */
export async function saveResumeAnalysis(
  userId: string,
  resumeUrl: string,
  fileName: string,
  analysisData: ResumeAnalysisData,
  suggestions: string[]
): Promise<ResumeAnalysis> {
  const { data, error } = await supabase
    .from('resume_analyses')
    .insert({
      user_id: userId,
      resume_url: resumeUrl,
      file_name: fileName,
      overall_score: analysisData.overallScore,
      analysis_data: analysisData,
      suggestions: suggestions,
      ats_score: analysisData.atsAnalysis.score
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving resume analysis:', error);
    throw new Error('Failed to save analysis to database');
  }
  
  return data as ResumeAnalysis;
}

/**
 * Get all resume analyses for a user
 */
export async function getUserResumeAnalyses(userId: string): Promise<ResumeAnalysis[]> {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('analyzed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching resume analyses:', error);
    throw error;
  }
  
  return data as ResumeAnalysis[];
}

/**
 * Get a single resume analysis by ID
 */
export async function getResumeAnalysisById(
  analysisId: string
): Promise<ResumeAnalysis | null> {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('id', analysisId)
    .single();
  
  if (error) {
    console.error('Error fetching resume analysis:', error);
    return null;
  }
  
  return data as ResumeAnalysis;
}

/**
 * Delete a resume analysis and its associated file
 */
export async function deleteResumeAnalysis(analysisId: string): Promise<void> {
  // First get the analysis to get the resume URL
  const analysis = await getResumeAnalysisById(analysisId);
  
  if (analysis) {
    // Delete the file from storage
    await deleteResumeFromStorage(analysis.resume_url);
    
    // Delete the database record
    const { error } = await supabase
      .from('resume_analyses')
      .delete()
      .eq('id', analysisId);
    
    if (error) {
      console.error('Error deleting resume analysis:', error);
      throw error;
    }
  }
}

// ============================================================================
// COMPLETE ANALYSIS WORKFLOW
// ============================================================================

/**
 * Complete workflow: Upload resume, extract text, analyze, and save
 */
export async function analyzeAndSaveResume(
  file: File,
  userId: string,
  targetRole: string = 'General'
): Promise<ResumeAnalysis> {
  try {
    // 1. Upload file to storage
    const resumeUrl = await uploadResumeToStorage(file, userId);
    
    // 2. Extract text from file
    const resumeText = await extractResumeText(file);
    
    if (!resumeText || resumeText.trim().length < 100) {
      throw new Error('Could not extract enough text from resume. Please ensure the file contains readable text.');
    }
    
    // 3. Analyze with AI
    const analysisData = await analyzeResume(resumeText, targetRole, userId);
    
    // 4. Generate suggestions
    const suggestions = generateResumeSuggestions(analysisData);
    
    // 5. Save to database
    const savedAnalysis = await saveResumeAnalysis(
      userId,
      resumeUrl,
      file.name,
      analysisData,
      suggestions
    );
    
    return savedAnalysis;
  } catch (error) {
    console.error('Error in complete analysis workflow:', error);
    throw error;
  }
}

/**
 * Compare two resume analyses to show improvement
 */
export function compareResumeAnalyses(
  oldAnalysis: ResumeAnalysis,
  newAnalysis: ResumeAnalysis
): {
  scoreDifference: number;
  atsScoreDifference: number;
  improvements: string[];
  remainingIssues: string[];
} {
  const scoreDiff = newAnalysis.overall_score - oldAnalysis.overall_score;
  const atsScoreDiff = newAnalysis.ats_score - oldAnalysis.ats_score;
  
  const improvements: string[] = [];
  const remainingIssues: string[] = [];
  
  // Compare section scores
  newAnalysis.analysis_data.sectionScores.forEach((newSection) => {
    const oldSection = oldAnalysis.analysis_data.sectionScores.find(
      (s) => s.name === newSection.name
    );
    
    if (oldSection && newSection.score > oldSection.score) {
      improvements.push(`${newSection.name} improved by ${newSection.score - oldSection.score} points`);
    } else if (newSection.score < 70) {
      remainingIssues.push(`${newSection.name} still needs work (${newSection.score}/100)`);
    }
  });
  
  // Check ATS improvements
  if (atsScoreDiff > 0) {
    improvements.push(`ATS compatibility improved by ${atsScoreDiff} points`);
  } else if (newAnalysis.ats_score < 70) {
    remainingIssues.push(`ATS score still below 70 (${newAnalysis.ats_score}/100)`);
  }
  
  return {
    scoreDifference: scoreDiff,
    atsScoreDifference: atsScoreDiff,
    improvements,
    remainingIssues
  };
}
