export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  department?: string;
  phone?: string;
  notifications?: number;
  // Student specific fields
  major?: string;
  year?: number;
  semester?: number;
  cgpa?: number;
  skills?: Skill[];
  preferences?: any;
  resume?: string;
  resume_url?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  PLACEMENT_OFFICER = 'PLACEMENT_OFFICER'
}

export enum OpportunityType {
  INTERNSHIP = 'INTERNSHIP',
  PLACEMENT = 'PLACEMENT'
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  verified?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  major: string;
  year: number;
  semester: number;
  cgpa: number;
  skills: Skill[];
  resume?: string;
  coverLetter?: string;
  preferences: {
    industries: string[];
    locations: string[];
    stipendRange: { min: number; max: number };
    opportunityTypes: OpportunityType[];
  };
  mentor?: string;
  completedInternships: number;
  placementStatus: 'unplaced' | 'placed' | 'in-process';
  avatar?: string;
}

export interface PlacementOfficerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole.PLACEMENT_OFFICER;
  managedDepartments: string[];
  yearsOfExperience: number;
  avatar?: string;
}

export interface JobOpportunity {
  id: string;
  role: string;
  company: string;
  companyId: string;
  logoUrl?: string;
  type: OpportunityType;
  department: string;
  requiredSkills: Skill[];
  minCgpa: number;
  description: string;
  responsibilities: string[];
  eligibility: string[];
  stipendRange?: { min: number; max: number };
  duration: string;
  location: string;
  deadline: string;
  postedDate: string;
  slots: number;
  filledSlots: number;
  placementConversion: boolean;
  status: 'active' | 'closed' | 'draft';
  postedBy: string; // placement officer ID
}

export interface Application {
  id: string;
  jobId: string;
  job: JobOpportunity;
  studentId: string;
  student: StudentProfile;
  status: ApplicationStatus;
  appliedDate: string;
  interviewSchedule?: {
    date: string;
    time: string;
    mode: 'online' | 'offline';
    location?: string;
    meetingLink?: string;
  };
  rejectionReason?: string;
  offerDetails?: {
    stipend: number;
    joiningDate: string;
    duration: string;
  };
}

export interface ExplanationRequest {
  studentName: string;
  studentSkills: string[];
  studentCgpa: number;
  jobRole: string;
  jobCompany: string;
  jobRequiredSkills: string[];
  jobMinCgpa: number;
}

// ============================================================================
// CALENDAR TYPES
// ============================================================================

export enum EventType {
  DEADLINE = 'DEADLINE',
  INTERVIEW = 'INTERVIEW',
  DRIVE = 'DRIVE',
  ANNOUNCEMENT = 'ANNOUNCEMENT'
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  opportunity_id?: string;
  application_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Populated from joins
  opportunity?: JobOpportunity;
  application?: Application;
}

export interface EventReminder {
  id: string;
  event_id: string;
  user_id: string;
  reminder_time: string;
  sent: boolean;
  created_at: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  opportunity_id?: string;
  application_id?: string;
}

// ============================================================================
// RESUME ANALYZER TYPES
// ============================================================================

export interface SectionScore {
  name: string;
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ATSAnalysis {
  score: number; // 0-100
  isATSFriendly: boolean;
  issues: string[];
  recommendations: string[];
  detectedSections: string[];
  missingSections: string[];
  keywordDensity: number;
}

export interface ResumeAnalysisData {
  overallScore: number;
  sectionScores: SectionScore[];
  atsAnalysis: ATSAnalysis;
  keywordAnalysis: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
  grammarIssues: string[];
  formattingIssues: string[];
  actionVerbs: {
    used: string[];
    suggested: string[];
  };
  quantifiableAchievements: {
    count: number;
    examples: string[];
    suggestions: string[];
  };
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  resume_url: string;
  file_name: string;
  overall_score: number;
  analysis_data: ResumeAnalysisData;
  suggestions: string[];
  ats_score: number;
  analyzed_at: string;
  created_at: string;
}

export interface AnalyzeResumeRequest {
  resumeText: string;
  fileName: string;
  targetRole?: string;
}