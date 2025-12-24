import { GoogleGenAI } from "@google/genai";
import { ExplanationRequest, Application } from '../types';

// Extended type for bulk analysis
export interface BulkAnalysisRequest {
  studentName: string;
  studentSkills: string[];
  studentCgpa: number;
  rejections: Array<{
    jobRole: string;
    jobCompany: string;
    jobRequiredSkills: string[];
    jobMinCgpa: number;
    rejectionDate?: string;
  }>;
}

export interface PatternAnalysis {
  commonMissingSkills: Array<{ skill: string; frequency: number }>;
  cgpaIssues: boolean;
  improvementPriorities: string[];
  industryInsights: string;
  progressTracking?: {
    previousAnalysisDate?: string;
    improvementsSince?: string[];
  };
}

// Get API key from environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Fail loudly if API key is missing
if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  throw new Error(
    '❌ Missing Gemini API Key!\n' +
    'Please create a .env file with:\n' +
    '  VITE_GEMINI_API_KEY=your_actual_api_key\n' +
    'Get your FREE API key from: https://aistudio.google.com/app/apikey'
  );
}

const ai = new GoogleGenAI({ apiKey });

// Rate limiting: Track request timestamps per user
const requestTracker = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 3;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = requestTracker.get(userId) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  requestTracker.set(userId, recentRequests);
  return true;
};

export const generateRejectionExplanation = async (
  data: ExplanationRequest, 
  userId: string = 'anonymous'
): Promise<string> => {
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return "You've reached the maximum number of AI analysis requests (3 per minute). Please wait a moment before trying again.";
  }

  const modelId = "gemini-2.0-flash-exp"; // Latest model
  
  const prompt = `
    You are a Career Intelligence AI for the 'WhyNot' platform.
    Your goal is to explain a placement rejection to a student in a constructive, factual, and data-driven way.
    
    Context:
    Student: ${data.studentName}
    Major/CGPA: ${data.studentCgpa}
    Student Skills: ${data.studentSkills.join(', ')}
    
    Target Opportunity:
    Role: ${data.jobRole} at ${data.jobCompany}
    Required Skills: ${data.jobRequiredSkills.join(', ')}
    Minimum CGPA: ${data.jobMinCgpa}
    
    Task:
    Compare the Student's profile against the Target Opportunity requirements.
    Identify the specific gap (e.g., missing specific skills like SQL, or low CGPA).
    Generate a 3-4 sentence explanation.
    
    Sentiment & Tone Guidelines:
    - Maintain a Constructive and Encouraging sentiment.
    - Be factual about the gaps (honesty is key), but frame the rejection as a "path to improvement" rather than a failure.
    - Use a futuristic, professional, yet supportive tone.
    - Avoid harsh or discouraging language. Focus on growth potential.
    
    Ending: Provide one specific recommended action (e.g., "Complete the Advanced SQL certification").
    
    Format: Plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency for UI responsiveness
      }
    });

    return response.text || "Unable to generate analysis at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "Invalid API key. Please check your Gemini API configuration.";
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return "API rate limit exceeded. Please try again in a few moments.";
      }
    }
    
    return "Our intelligence systems are currently recalibrating. Please try again later.";
  }
};

/**
 * Bulk Analysis: Analyze multiple rejections at once to identify patterns
 */
export const generateBulkRejectionAnalysis = async (
  data: BulkAnalysisRequest,
  userId: string = 'anonymous'
): Promise<PatternAnalysis> => {
  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new Error("Rate limit exceeded. Please wait a moment.");
  }

  const modelId = "gemini-2.0-flash-exp";

  const prompt = `
    You are a Career Intelligence AI analyzing multiple rejection patterns.
    
    Student Profile:
    Name: ${data.studentName}
    CGPA: ${data.studentCgpa}
    Current Skills: ${data.studentSkills.join(', ')}
    
    Rejection History (${data.rejections.length} applications):
    ${data.rejections.map((r, i) => `
    ${i + 1}. ${r.jobRole} at ${r.jobCompany}
       Required: ${r.jobRequiredSkills.join(', ')}
       Min CGPA: ${r.jobMinCgpa}
    `).join('\n')}
    
    Task: Analyze all rejections and identify patterns.
    
    Respond in this EXACT JSON format:
    {
      "commonMissingSkills": [
        {"skill": "skill name", "frequency": number of times missing}
      ],
      "cgpaIssues": true or false (if CGPA is consistently below requirements),
      "improvementPriorities": [
        "Priority 1: Most critical skill/area to improve",
        "Priority 2: Second most important",
        "Priority 3: Additional improvement area"
      ],
      "industryInsights": "A 2-3 sentence insight about the industries/roles they're targeting and what's commonly required"
    }
    
    Focus on actionable insights. Be specific about which skills appear most frequently in rejections.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseFormat: "json"
      }
    });

    const text = response.text || '{}';
    // Clean up the response (remove markdown code blocks if present)
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonText);
    
    return analysis as PatternAnalysis;
  } catch (error) {
    console.error("Bulk Analysis Error:", error);
    // Return a fallback analysis
    return {
      commonMissingSkills: [],
      cgpaIssues: false,
      improvementPriorities: ["Unable to generate analysis. Please try again."],
      industryInsights: "Analysis temporarily unavailable."
    };
  }
};

/**
 * Export analysis as a formatted text for PDF generation
 */
export const formatAnalysisForExport = (
  studentName: string,
  analysis: string,
  application: { role: string; company: string },
  date: string = new Date().toLocaleDateString()
): string => {
  return `
═══════════════════════════════════════════════════════
           WHYNOT - AI REJECTION ANALYSIS REPORT
═══════════════════════════════════════════════════════

Student: ${studentName}
Position: ${application.role}
Company: ${application.company}
Analysis Date: ${date}

───────────────────────────────────────────────────────
                    DETAILED ANALYSIS
───────────────────────────────────────────────────────

${analysis}

───────────────────────────────────────────────────────
                  GENERATED BY GEMINI AI
───────────────────────────────────────────────────────

This analysis is powered by Google's Gemini 2.0 AI model
and is designed to provide constructive, data-driven 
insights to help you improve your future applications.

WhyNot Platform - Turning Rejections into Opportunities
═══════════════════════════════════════════════════════
  `.trim();
};

// ============================================================================
// RESUME ANALYSIS
// ============================================================================

/**
 * Analyze a resume using Gemini AI
 * Returns comprehensive analysis including ATS compatibility, section scores, and suggestions
 */
export const analyzeResume = async (
  resumeText: string,
  targetRole: string = 'General',
  userId: string
): Promise<any> => {
  if (!checkRateLimit(userId)) {
    throw new Error('Rate limit exceeded. Please wait a minute before analyzing another resume.');
  }

  try {
    const prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist. Analyze the following resume and provide a comprehensive evaluation.

RESUME CONTENT:
${resumeText}

TARGET ROLE: ${targetRole}

Provide a detailed analysis in the following JSON format:
{
  "overallScore": <0-100>,
  "sectionScores": [
    {
      "name": "Contact Information",
      "score": <0-100>,
      "feedback": "Brief feedback",
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"]
    },
    {
      "name": "Professional Summary/Objective",
      "score": <0-100>,
      "feedback": "Brief feedback",
      "strengths": [],
      "improvements": []
    },
    {
      "name": "Work Experience",
      "score": <0-100>,
      "feedback": "Brief feedback",
      "strengths": [],
      "improvements": []
    },
    {
      "name": "Education",
      "score": <0-100>,
      "feedback": "Brief feedback",
      "strengths": [],
      "improvements": []
    },
    {
      "name": "Skills",
      "score": <0-100>,
      "feedback": "Brief feedback",
      "strengths": [],
      "improvements": []
    }
  ],
  "atsAnalysis": {
    "score": <0-100>,
    "isATSFriendly": <true/false>,
    "issues": ["issue1", "issue2"],
    "recommendations": ["rec1", "rec2"],
    "detectedSections": ["Contact", "Experience", "Education", "Skills"],
    "missingSections": ["Certifications", "Projects"],
    "keywordDensity": <0-100>
  },
  "keywordAnalysis": {
    "found": ["keyword1", "keyword2"],
    "missing": ["missing1", "missing2"],
    "suggestions": ["Add X", "Include Y"]
  },
  "grammarIssues": ["issue1", "issue2"],
  "formattingIssues": ["issue1", "issue2"],
  "actionVerbs": {
    "used": ["Led", "Managed", "Developed"],
    "suggested": ["Orchestrated", "Spearheaded", "Architected"]
  },
  "quantifiableAchievements": {
    "count": <number>,
    "examples": ["Increased sales by 30%"],
    "suggestions": ["Add metrics to X", "Quantify Y"]
  }
}

EVALUATION CRITERIA:
1. ATS Compatibility: Check for standard section headers, simple formatting, no tables/graphics
2. Content Quality: Strong action verbs, quantifiable achievements, relevant experience
3. Relevance: Keywords matching ${targetRole} position
4. Formatting: Clean structure, consistent formatting, appropriate length
5. Grammar: Professional language, no errors

Be specific and actionable in your feedback. Focus on improvements that will have the most impact.`;

    const model = ai.models['gemini-2.0-flash-exp'];
    const result = await model.generateContent(prompt);
    const response = result.text;

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    throw new Error(error.message || 'Failed to analyze resume. Please try again.');
  }
};

/**
 * Generate top-level suggestions from analysis data
 */
export const generateResumeSuggestions = (analysisData: any): string[] => {
  const suggestions: string[] = [];

  // Overall score-based suggestions
  if (analysisData.overallScore < 60) {
    suggestions.push('🔴 Overall resume needs significant improvement. Focus on the high-priority items below.');
  } else if (analysisData.overallScore < 80) {
    suggestions.push('🟡 Good foundation, but several areas need refinement for competitive applications.');
  } else {
    suggestions.push('🟢 Strong resume! Minor tweaks will make it excellent.');
  }

  // ATS suggestions
  if (analysisData.atsAnalysis.score < 70) {
    suggestions.push(`⚠️ ATS Score: ${analysisData.atsAnalysis.score}/100 - Your resume may not pass automated screening`);
  }

  // Section-specific suggestions
  const weakSections = analysisData.sectionScores
    .filter((s: any) => s.score < 70)
    .map((s: any) => s.name);
  
  if (weakSections.length > 0) {
    suggestions.push(`📋 Weak sections that need work: ${weakSections.join(', ')}`);
  }

  // Missing keywords
  if (analysisData.keywordAnalysis.missing.length > 0) {
    const topMissing = analysisData.keywordAnalysis.missing.slice(0, 3).join(', ');
    suggestions.push(`🔑 Add these important keywords: ${topMissing}`);
  }

  // Quantifiable achievements
  if (analysisData.quantifiableAchievements.count < 3) {
    suggestions.push('📊 Add more quantifiable achievements with numbers, percentages, or metrics');
  }

  // Action verbs
  if (analysisData.actionVerbs.suggested.length > 0) {
    suggestions.push('💪 Replace weak verbs with stronger action verbs like: ' + 
                    analysisData.actionVerbs.suggested.slice(0, 3).join(', '));
  }

  return suggestions;
};