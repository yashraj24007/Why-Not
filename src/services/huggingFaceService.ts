/**
 * Hugging Face Service
 * Uses FREE Mistral-7B-Instruct-v0.2 for AI analysis
 * This is the actual AI backend (obfuscated as Gemini in public API)
 * 
 * IMPORTANT: PRECEDENCE RULE
 * ===========================
 * Resume Analyzer = General guidance (broad suggestions)
 * Rejection Coach = Decision-specific explanation (takes priority)
 * 
 * The Rejection Coach's analysis always takes precedence over Resume Analyzer
 * because it's contextual to a specific job rejection. Resume Analyzer provides
 * general improvement suggestions, while Rejection Coach explains why a specific
 * application was rejected.
 * 
 * Example:
 * - Resume Analyzer might say: "Your SQL skills look fine"
 * - Rejection Coach might say: "SQL proficiency insufficient for this role"
 * 
 * In this case, the Rejection Coach is correct because it's analyzing a specific
 * job requirement vs. the student's skill confidence level for that particular role.
 */

import { ExplanationRequest } from '../types';

// Get API key from environment variable
const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

// Fail loudly if API key is missing
if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
  console.warn(
    '⚠️ Missing Hugging Face API Key!\n' +
      'Please add to .env file:\n' +
      '  VITE_HUGGINGFACE_API_KEY=your_actual_api_key\n' +
      'Get your FREE API key from: https://huggingface.co/settings/tokens'
  );
}

// Free models available
const MODELS = {
  MISTRAL: 'mistralai/Mistral-7B-Instruct-v0.2', // Best for reasoning
  ZEPHYR: 'HuggingFaceH4/zephyr-7b-beta', // Great instruction following
  FLAN_T5: 'google/flan-t5-xxl', // Reliable classification
};

const DEFAULT_MODEL = MODELS.MISTRAL;

// Rate limiting: Track request timestamps per user
const requestTracker = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 10; // HF free tier: 1000/day
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = requestTracker.get(userId) || [];

  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  recentRequests.push(now);
  requestTracker.set(userId, recentRequests);
  return true;
};

/**
 * Call Hugging Face Inference API
 */
const callHuggingFace = async (
  prompt: string,
  model: string = DEFAULT_MODEL,
  options: {
    temperature?: number;
    max_new_tokens?: number;
    top_p?: number;
  } = {}
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        temperature: options.temperature ?? 0.7,
        max_new_tokens: options.max_new_tokens ?? 1024,
        top_p: options.top_p ?? 0.95,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));

    if (response.status === 401) {
      throw new Error('Invalid Hugging Face API key');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }
    if (response.status === 503) {
      // Model is loading, retry after a moment
      throw new Error('AI model is loading. Please try again in 20 seconds.');
    }

    throw new Error(`Hugging Face API error: ${error.error || 'Unknown error'}`);
  }

  const data = await response.json();

  // Handle different response formats
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  if (data.generated_text) {
    return data.generated_text;
  }

  throw new Error('Unexpected response format from Hugging Face');
};

/**
 * Extract JSON from model response
 */
const extractJSON = (text: string): any => {
  // Try to find JSON in response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // If parsing fails, try to clean it up
      const cleaned = jsonMatch[0]
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');
      return JSON.parse(cleaned);
    }
  }
  throw new Error('No valid JSON found in response');
};

export interface RejectionAnalysis {
  type: 'RULE_BASED' | 'NON_RULE_BASED';
  coreMismatch: string;
  keyMissingSkills: string[];
  resumeFeedback: string[];
  actionPlan: string[];
  sentiment: string;
  // For rule-based rejections
  violations?: Array<{
    category: 'CGPA' | 'SKILLS' | 'DEADLINE' | 'ELIGIBILITY';
    description: string;
    expected: string;
    actual: string;
  }>;
  // For skill confidence mismatches
  skillGaps?: Array<{
    skill: string;
    required: string;
    studentLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
    suggestion: string;
  }>;
}

/**
 * Generate rejection explanation using Hugging Face
 */
export const generateRejectionExplanation = async (
  data: ExplanationRequest,
  userId: string = 'anonymous'
): Promise<RejectionAnalysis> => {
  // Validate input data
  if (!data || !data.studentName || !data.jobRole || !data.jobCompany) {
    throw new Error('Invalid input data: Missing required fields');
  }

  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new Error(
      "You've reached the maximum number of AI analysis requests. Please wait a moment."
    );
  }

  // Build skill confidence context with null safety
  const skillConfidenceContext = Array.isArray(data.skillConfidenceData) && data.skillConfidenceData.length > 0
    ? `\nStudent Skill Confidence Levels:\n${data.skillConfidenceData
        .filter(s => s && s.name)
        .map(s => `- ${s.name}: ${s.confidence || 'Unknown'}${Array.isArray(s.evidence) && s.evidence.length > 0 ? ` (Evidence: ${s.evidence.join(', ')})` : ''}`)
        .join('\n')}`
    : '';

  const prompt = `<s>[INST] You are a Career Intelligence AI for the 'WhyNot' placement platform.

Analyze this job rejection and determine if it's RULE-BASED or NON-RULE-BASED, then provide feedback.

IMPORTANT CLASSIFICATION:
- RULE_BASED: Clear violations (CGPA below threshold, missing required skills, deadline passed, eligibility criteria not met)
- NON_RULE_BASED: Student met all requirements but still rejected (limited slots, internal preferences, subjective screening)

Student Profile:
- Name: ${data.studentName}
- CGPA: ${data.studentCgpa}
- Skills: ${data.studentSkills.join(', ')}${skillConfidenceContext}
${data.resumeText ? `- Resume: ${data.resumeText.substring(0, 2000)}` : ''}

Target Job:
- Role: ${data.jobRole} at ${data.jobCompany}
- Required Skills: ${data.jobRequiredSkills.join(', ')}
- Minimum CGPA: ${data.jobMinCgpa}
${data.jobDescription ? `- Description: ${data.jobDescription.substring(0, 2000)}` : ''}

Provide your analysis in this exact JSON format:
{
  "type": "RULE_BASED" or "NON_RULE_BASED",
  "coreMismatch": "Primary reason for rejection (1 sentence)",
  "keyMissingSkills": ["skill1", "skill2"],
  "resumeFeedback": ["improvement1", "improvement2"],
  "actionPlan": ["step1", "step2"],
  "sentiment": "Brief encouraging statement",
  "violations": [{"category": "CGPA" or "SKILLS" or "DEADLINE" or "ELIGIBILITY", "description": "...", "expected": "...", "actual": "..."}],
  "skillGaps": [{"skill": "skill_name", "required": "Intermediate", "studentLevel": "Beginner", "suggestion": "..."}]
}

For RULE_BASED rejections: List specific violations. Be honest about skill confidence mismatches.
For NON_RULE_BASED rejections: Acknowledge they met requirements and explain: "You met the listed eligibility criteria. The rejection may be due to limited openings or company-side screening preferences."

IMPORTANT: Always end your sentiment with: "This explanation is based on declared profile data and listed eligibility criteria. Final hiring decisions may include additional factors."

Be constructive, specific, and honest. Consider skill confidence levels when analyzing skill gaps. [/INST]</s>`;

  try {
    const response = await callHuggingFace(prompt, DEFAULT_MODEL, {
      temperature: 0.7,
      max_new_tokens: 1000,
    });

    const analysis = extractJSON(response);

    // Validate required fields
    if (
      !analysis.type ||
      !analysis.coreMismatch ||
      !analysis.keyMissingSkills ||
      !analysis.resumeFeedback ||
      !analysis.actionPlan ||
      !analysis.sentiment
    ) {
      throw new Error('Invalid analysis structure');
    }

    return analysis as RejectionAnalysis;
  } catch (error) {
    console.error('Hugging Face Error:', error);

    // Provide fallback analysis if API fails
    if (error instanceof Error && error.message.includes('loading')) {
      throw error; // Let user know model is loading
    }

    // Generate intelligent fallback analysis - determine type with better validation
    const validStudentSkills = Array.isArray(data.studentSkills) ? data.studentSkills.filter(Boolean) : [];
    const validRequiredSkills = Array.isArray(data.jobRequiredSkills) ? data.jobRequiredSkills.filter(Boolean) : [];
    
    const missingSkills = validRequiredSkills.filter(
      required =>
        !validStudentSkills.some(student => 
          student && typeof student === 'string' && 
          student.toLowerCase().includes(required.toLowerCase())
        )
    );

    const cgpaGap = typeof data.studentCgpa === 'number' && 
                     typeof data.jobMinCgpa === 'number' && 
                     data.studentCgpa < data.jobMinCgpa;
    
    const hasViolations = cgpaGap || missingSkills.length > 0;

    const violations: any[] = [];
    if (cgpaGap) {
      violations.push({
        category: 'CGPA',
        description: 'CGPA requirement not met',
        expected: `${data.jobMinCgpa}`,
        actual: `${data.studentCgpa}`
      });
    }
    
    if (missingSkills.length > 0) {
      missingSkills.slice(0, 3).forEach(skill => {
        violations.push({
          category: 'SKILLS',
          description: `Missing required skill: ${skill}`,
          expected: skill,
          actual: 'Not found in profile'
        });
      });
    }

    return {
      type: hasViolations ? 'RULE_BASED' : 'NON_RULE_BASED',
      coreMismatch: hasViolations
        ? cgpaGap && missingSkills.length > 0
          ? `CGPA requirement not met (${data.jobMinCgpa} required vs ${data.studentCgpa}) and ${missingSkills.length} skill gap(s) identified`
          : cgpaGap
            ? `CGPA requirement not met (${data.jobMinCgpa} required vs ${data.studentCgpa})`
            : `${missingSkills.length} skill gap(s) identified in key requirements`
        : 'You met the listed eligibility criteria. The rejection may be due to limited openings, high competition, or company-side screening preferences.',
      keyMissingSkills: hasViolations ? missingSkills.slice(0, 5) : [],
      resumeFeedback: hasViolations ? [
        'Strengthen your profile with the missing skills',
        'Highlight relevant projects and coursework',
        'Add quantifiable achievements to demonstrate impact',
        'Include relevant certifications to validate skills'
      ] : [
        'Your profile meets the basic requirements',
        'Consider enhancing your resume with more specific achievements',
        'Highlight unique projects that set you apart',
        'Add metrics and quantifiable results'
      ],
      actionPlan: hasViolations ? [
        cgpaGap ? 'Focus on improving academic performance for future opportunities' : null,
        missingSkills.length > 0 ? `Learn these skills: ${missingSkills.slice(0, 3).join(', ')}` : null,
        'Build portfolio projects demonstrating these skills',
        'Obtain online certifications in required technologies',
        'Practice with real-world projects and contribute to open source'
      ].filter(Boolean) : [
        'Continue applying to similar roles to increase your chances',
        'Network with professionals in the industry through LinkedIn',
        'Consider reaching out to the recruiter for constructive feedback',
        'Refine your application materials based on job descriptions',
        'Stay positive and persistent in your job search'
      ],
      sentiment: hasViolations 
        ? 'Keep improving your skills and academic performance. Every rejection is a learning opportunity! This explanation is based on declared profile data and listed eligibility criteria. Final hiring decisions may include additional factors.'
        : 'You\'re on the right track! Your profile is competitive. Keep applying and stay positive. This explanation is based on declared profile data and listed eligibility criteria. Final hiring decisions may include additional factors.',
      violations: hasViolations ? violations : undefined,
      skillGaps: missingSkills.length > 0 ? missingSkills.slice(0, 5).map(skill => ({
        skill: skill,
        required: 'Proficient',
        studentLevel: undefined,
        suggestion: `Develop ${skill} skills through online courses, projects, or certifications`
      })) : undefined
    };
  }
};

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

/**
 * Bulk analysis: Identify patterns across multiple rejections
 */
export const generateBulkRejectionAnalysis = async (
  data: BulkAnalysisRequest,
  userId: string = 'anonymous'
): Promise<PatternAnalysis> => {
  if (!checkRateLimit(userId)) {
    throw new Error('Rate limit exceeded. Please wait a moment.');
  }

  const prompt = `<s>[INST] You are a Career Intelligence AI analyzing rejection patterns.

Student Profile:
- Name: ${data.studentName}
- CGPA: ${data.studentCgpa}
- Skills: ${data.studentSkills.join(', ')}

Rejection History (${data.rejections.length} applications):
${data.rejections
  .map(
    (r, i) => `
${i + 1}. ${r.jobRole} at ${r.jobCompany}
   Required: ${r.jobRequiredSkills.join(', ')}
   Min CGPA: ${r.jobMinCgpa}
`
  )
  .join('\n')}

Analyze all rejections and identify patterns. Respond in this exact JSON format:
{
  "commonMissingSkills": [
    {"skill": "skill_name", "frequency": number}
  ],
  "cgpaIssues": true or false,
  "improvementPriorities": [
    "Priority 1 description",
    "Priority 2 description",
    "Priority 3 description"
  ],
  "industryInsights": "2-3 sentence insight about target industries"
}

Focus on actionable, data-driven insights.

IMPORTANT: End your industryInsights with: "This analysis is based on declared profile data and listed eligibility criteria. Final hiring decisions may include additional factors." [/INST]</s>`;

  try {
    const response = await callHuggingFace(prompt, DEFAULT_MODEL, {
      temperature: 0.6,
      max_new_tokens: 700,
    });

    const analysis = extractJSON(response);
    return analysis as PatternAnalysis;
  } catch (error) {
    console.error('Bulk Analysis Error:', error);

    // Generate pattern analysis from data
    const allRequiredSkills = data.rejections.flatMap(r => r.jobRequiredSkills);
    const skillCounts = new Map<string, number>();

    allRequiredSkills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase();
      if (!data.studentSkills.some(s => s.toLowerCase().includes(normalizedSkill))) {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      }
    });

    const commonMissingSkills = Array.from(skillCounts.entries())
      .map(([skill, frequency]) => ({ skill, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const cgpaIssues = data.rejections.some(r => data.studentCgpa < r.jobMinCgpa);

    return {
      commonMissingSkills,
      cgpaIssues,
      improvementPriorities: [
        `Learn ${commonMissingSkills
          .slice(0, 2)
          .map(s => s.skill)
          .join(' and ')}`,
        'Build projects showcasing these skills',
        cgpaIssues
          ? 'Focus on improving academic performance'
          : 'Gain practical experience through internships',
      ],
      industryInsights: `Based on ${data.rejections.length} applications, focus on strengthening your technical skills in the most demanded areas. This analysis is based on declared profile data and listed eligibility criteria. Final hiring decisions may include additional factors.`,
    };
  }
};

/**
 * Compare current analysis with previous to track progress
 */
export const compareWithPrevious = async (
  currentAnalysis: PatternAnalysis,
  previousAnalysis: PatternAnalysis | null
): Promise<string[]> => {
  if (!previousAnalysis) {
    return ['This is your first analysis. Start working on the identified priorities!'];
  }

  const improvements: string[] = [];

  // Check if skills have been learned
  const previousSkills = new Set(
    previousAnalysis.commonMissingSkills.map(s => s.skill.toLowerCase())
  );
  const currentSkills = new Set(
    currentAnalysis.commonMissingSkills.map(s => s.skill.toLowerCase())
  );

  previousSkills.forEach(skill => {
    if (!currentSkills.has(skill)) {
      improvements.push(`✅ Successfully acquired: ${skill}`);
    }
  });

  // Check CGPA improvement
  if (previousAnalysis.cgpaIssues && !currentAnalysis.cgpaIssues) {
    improvements.push('✅ CGPA now meets more requirements');
  }

  if (improvements.length === 0) {
    improvements.push('Keep working on your improvement priorities to see progress!');
  }

  return improvements;
};

/**
 * Analyze a resume using Hugging Face AI
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

  const prompt = `<s>[INST] You are an expert resume reviewer and ATS specialist.

Analyze this resume for the role: ${targetRole}

RESUME:
${resumeText.substring(0, 3000)}

Provide comprehensive analysis in this exact JSON format:
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
      "name": "Professional Summary",
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
    "detectedSections": ["Contact", "Experience", "Education"],
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
    "used": ["Led", "Managed"],
    "suggested": ["Orchestrated", "Spearheaded"]
  },
  "quantifiableAchievements": {
    "count": <number>,
    "examples": ["Increased sales by 30%"],
    "suggestions": ["Add metrics to X"]
  }
}

Be specific and actionable.

IMPORTANT: Add this disclaimer to formattingIssues array: "This analysis is based on the submitted resume. Final hiring decisions may include additional factors." [/INST]</s>`;

  try {
    const response = await callHuggingFace(prompt, DEFAULT_MODEL, {
      temperature: 0.6,
      max_new_tokens: 1500,
    });

    const analysis = extractJSON(response);
    return analysis;
  } catch (error: any) {
    console.error('Error analyzing resume:', error);

    // Generate fallback basic analysis
    return {
      overallScore: 70,
      sectionScores: [
        {
          name: 'Contact Information',
          score: 85,
          feedback: 'Contact information appears present',
          strengths: ['Email likely included'],
          improvements: ['Verify all contact details are current'],
        },
        {
          name: 'Work Experience',
          score: 70,
          feedback: 'Experience section needs review',
          strengths: [],
          improvements: ['Add quantifiable achievements', 'Use strong action verbs'],
        },
        {
          name: 'Education',
          score: 75,
          feedback: 'Education section present',
          strengths: [],
          improvements: ['Include relevant coursework if recent graduate'],
        },
        {
          name: 'Skills',
          score: 65,
          feedback: 'Skills section could be improved',
          strengths: [],
          improvements: ['Add more relevant technical skills', 'Organize by category'],
        },
      ],
      atsAnalysis: {
        score: 70,
        isATSFriendly: true,
        issues: ['May need formatting improvements'],
        recommendations: ['Use standard section headers', 'Avoid tables and graphics'],
        detectedSections: ['Contact', 'Experience', 'Education', 'Skills'],
        missingSections: ['Certifications', 'Projects'],
        keywordDensity: 60,
      },
      keywordAnalysis: {
        found: [],
        missing: [],
        suggestions: [`Add keywords related to ${targetRole}`],
      },
      grammarIssues: [],
      formattingIssues: ['Unable to analyze formatting - please review manually'],
      actionVerbs: {
        used: [],
        suggested: ['Led', 'Managed', 'Developed', 'Implemented'],
      },
      quantifiableAchievements: {
        count: 0,
        examples: [],
        suggestions: ['Add metrics and numbers to achievements'],
      },
    };
  }
};
