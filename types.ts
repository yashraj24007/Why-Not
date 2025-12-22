export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  OFFERED = 'OFFERED'
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface StudentProfile {
  id: string;
  name: string;
  major: string;
  cgpa: number;
  skills: Skill[];
}

export interface JobOpportunity {
  id: string;
  role: string;
  company: string;
  logoUrl?: string;
  requiredSkills: Skill[];
  minCgpa: number;
}

export interface Application {
  id: string;
  jobId: string;
  job: JobOpportunity;
  studentId: string;
  status: ApplicationStatus;
  appliedDate: string;
  rejectionReason?: string; // Pre-filled or AI generated context
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