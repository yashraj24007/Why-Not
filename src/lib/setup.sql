-- ============================================================================
-- PLACEMENT MANAGEMENT SYSTEM - DATABASE SETUP
-- ============================================================================
-- Complete database schema for placement management with:
-- - User profiles (students & placement officers)
-- - Job opportunities & applications
-- - Calendar events & reminders
-- - Resume analysis
-- - Rejection analysis
-- - Notifications
--
-- USAGE: Run this entire script in your Supabase SQL editor
-- WARNING: This will DROP all existing tables and data!
-- ============================================================================

-- ============================================================================
-- CLEANUP: Drop existing tables, functions, and extensions
-- ============================================================================
-- NOTE: If you get "must be owner" errors, comment out the DROP statements
-- or run this script in Supabase SQL Editor as the project owner

-- Drop tables in reverse dependency order (comment out if permission issues)
-- DROP TABLE IF EXISTS public.resume_analyses CASCADE;
-- DROP TABLE IF EXISTS public.event_reminders CASCADE;
-- DROP TABLE IF EXISTS public.calendar_events CASCADE;
-- DROP TABLE IF EXISTS public.rejection_analyses CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.applications CASCADE;
-- DROP TABLE IF EXISTS public.opportunities CASCADE;
-- DROP TABLE IF EXISTS public.student_profiles CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions (comment out if permission issues)
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get user role (bypasses RLS to prevent infinite recursion)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- User Profiles Table
-- Stores basic user information for both students and placement officers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'PLACEMENT_OFFICER')),
  avatar TEXT,
  department TEXT,
  organization TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
CREATE POLICY "Allow profile creation during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Placement officers can view all profiles
DROP POLICY IF EXISTS "Placement officers can view all profiles" ON public.profiles;
CREATE POLICY "Placement officers can view all profiles"
  ON public.profiles FOR SELECT
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Student Profiles Table
-- Extended profile information specific to students
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  major TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 5),
  semester INTEGER CHECK (semester >= 1 AND semester <= 10),
  cgpa DECIMAL(4,2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
  resume_url TEXT,
  cover_letter TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  placement_status TEXT DEFAULT 'unplaced' CHECK (placement_status IN ('unplaced', 'placed', 'in-process')),
  completed_internships INTEGER DEFAULT 0,
  mentor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'placement_status') THEN
    ALTER TABLE public.student_profiles ADD COLUMN placement_status TEXT DEFAULT 'unplaced' CHECK (placement_status IN ('unplaced', 'placed', 'in-process'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'completed_internships') THEN
    ALTER TABLE public.student_profiles ADD COLUMN completed_internships INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'mentor') THEN
    ALTER TABLE public.student_profiles ADD COLUMN mentor TEXT;
  END IF;
END $$;

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_profiles
DROP POLICY IF EXISTS "Students can view their own profile" ON public.student_profiles;
CREATE POLICY "Students can view their own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Students can insert their own profile" ON public.student_profiles;
CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Students can update their own profile" ON public.student_profiles;
CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Placement officers can view all student profiles" ON public.student_profiles;
CREATE POLICY "Placement officers can view all student profiles"
  ON public.student_profiles FOR SELECT
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_cgpa ON public.student_profiles(cgpa);
CREATE INDEX IF NOT EXISTS idx_student_profiles_year ON public.student_profiles(year);
CREATE INDEX IF NOT EXISTS idx_student_profiles_major ON public.student_profiles(major);
CREATE INDEX IF NOT EXISTS idx_student_profiles_placement_status ON public.student_profiles(placement_status);

-- -----------------------------------------------------------------------------
-- Opportunities Table
-- Job postings (internships and placements)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INTERNSHIP', 'PLACEMENT')),
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  application_url TEXT, -- Optional: External application URL
  posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  department TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  eligibility JSONB DEFAULT '[]'::jsonb,
  min_cgpa DECIMAL(3,2) CHECK (min_cgpa >= 0.00 AND min_cgpa <= 10.00),
  stipend_min INTEGER,
  stipend_max INTEGER,
  location TEXT,
  duration TEXT,
  slots INTEGER DEFAULT 0,
  filled_slots INTEGER DEFAULT 0,
  placement_conversion BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  posted_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'application_url') THEN
    ALTER TABLE public.opportunities ADD COLUMN application_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'posted_date') THEN
    ALTER TABLE public.opportunities ADD COLUMN posted_date TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities
DROP POLICY IF EXISTS "Everyone can view active opportunities" ON public.opportunities;
CREATE POLICY "Everyone can view active opportunities"
  ON public.opportunities FOR SELECT
  USING (
    status = 'active' 
    OR posted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.opportunity_id = opportunities.id 
      AND applications.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Placement officers can create opportunities" ON public.opportunities;
CREATE POLICY "Placement officers can create opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

DROP POLICY IF EXISTS "Creators can update their opportunities" ON public.opportunities;
CREATE POLICY "Creators can update their opportunities"
  ON public.opportunities FOR UPDATE
  USING (posted_by = auth.uid());

DROP POLICY IF EXISTS "Creators can delete their opportunities" ON public.opportunities;
CREATE POLICY "Creators can delete their opportunities"
  ON public.opportunities FOR DELETE
  USING (posted_by = auth.uid());

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_date ON public.opportunities(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_company ON public.opportunities(company_name);

-- -----------------------------------------------------------------------------
-- Applications Table
-- Student applications to opportunities
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED')),
  cover_letter TEXT,
  rejection_reason TEXT,
  interview_date TIMESTAMPTZ,
  interview_time TEXT,
  interview_mode TEXT CHECK (interview_mode IN ('online', 'offline')),
  interview_location TEXT,
  interview_meeting_link TEXT,
  offer_stipend INTEGER,
  offer_joining_date DATE,
  offer_duration TEXT,
  applied_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, student_id)
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'applied_date') THEN
    ALTER TABLE public.applications ADD COLUMN applied_date TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
DROP POLICY IF EXISTS "Students can view their own applications" ON public.applications;
CREATE POLICY "Students can view their own applications"
  ON public.applications FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can create applications" ON public.applications;
CREATE POLICY "Students can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own applications" ON public.applications;
CREATE POLICY "Students can update their own applications"
  ON public.applications FOR UPDATE
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Placement officers can view all applications" ON public.applications;
CREATE POLICY "Placement officers can view all applications"
  ON public.applications FOR SELECT
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

DROP POLICY IF EXISTS "Placement officers can update applications" ON public.applications;
CREATE POLICY "Placement officers can update applications"
  ON public.applications FOR UPDATE
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON public.applications(applied_date DESC);

-- -----------------------------------------------------------------------------
-- Notifications Table
-- System notifications for users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('application_status', 'new_opportunity', 'interview_scheduled', 'profile_update', 'general', 'deadline_reminder', 'event_reminder')),
  read BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_type TEXT CHECK (related_type IN ('opportunity', 'application', 'event', 'profile')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================================
-- FEATURE-SPECIFIC TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Rejection Analyses Table
-- AI-powered rejection reason analysis
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rejection_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  analysis_type TEXT DEFAULT 'single' CHECK (analysis_type IN ('single', 'bulk', 'pattern')),
  analysis_text TEXT NOT NULL,
  pattern_data JSONB, -- For bulk analysis: common patterns, missing skills, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rejection_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Students can view their own analyses" ON public.rejection_analyses;
CREATE POLICY "Students can view their own analyses"
  ON public.rejection_analyses FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can insert their own analyses" ON public.rejection_analyses;
CREATE POLICY "Students can insert their own analyses"
  ON public.rejection_analyses FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Placement officers can view all analyses" ON public.rejection_analyses;
CREATE POLICY "Placement officers can view all analyses"
  ON public.rejection_analyses FOR SELECT
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rejection_analyses_student ON public.rejection_analyses(student_id);
CREATE INDEX IF NOT EXISTS idx_rejection_analyses_application ON public.rejection_analyses(application_id);
CREATE INDEX IF NOT EXISTS idx_rejection_analyses_created ON public.rejection_analyses(created_at DESC);

-- -----------------------------------------------------------------------------
-- Calendar Events Table
-- Events for deadlines, interviews, drives, and announcements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('DEADLINE', 'INTERVIEW', 'DRIVE', 'ANNOUNCEMENT')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Students can view all calendar events" ON public.calendar_events;
CREATE POLICY "Students can view all calendar events"
  ON public.calendar_events FOR SELECT
  USING (get_user_role(auth.uid()) = 'STUDENT');

DROP POLICY IF EXISTS "Placement officers can view all calendar events" ON public.calendar_events;
CREATE POLICY "Placement officers can view all calendar events"
  ON public.calendar_events FOR SELECT
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

DROP POLICY IF EXISTS "Placement officers can create events" ON public.calendar_events;
CREATE POLICY "Placement officers can create events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

DROP POLICY IF EXISTS "Placement officers can update events" ON public.calendar_events;
CREATE POLICY "Placement officers can update events"
  ON public.calendar_events FOR UPDATE
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

DROP POLICY IF EXISTS "Placement officers can delete events" ON public.calendar_events;
CREATE POLICY "Placement officers can delete events"
  ON public.calendar_events FOR DELETE
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_opportunity ON public.calendar_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_application ON public.calendar_events(application_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_creator ON public.calendar_events(created_by);

-- -----------------------------------------------------------------------------
-- Event Reminders Table
-- User-specific reminders for calendar events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_time TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.event_reminders;
CREATE POLICY "Users can view their own reminders"
  ON public.event_reminders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own reminders" ON public.event_reminders;
CREATE POLICY "Users can create their own reminders"
  ON public.event_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reminders" ON public.event_reminders;
CREATE POLICY "Users can update their own reminders"
  ON public.event_reminders FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.event_reminders;
CREATE POLICY "Users can delete their own reminders"
  ON public.event_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_reminders_user ON public.event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON public.event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_time ON public.event_reminders(reminder_time) WHERE sent = FALSE;

-- -----------------------------------------------------------------------------
-- Resume Analyses Table
-- AI-powered resume analysis with ATS scoring
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  analysis_data JSONB, -- Detailed breakdown: sections, keywords, formatting, grammar
  suggestions TEXT[], -- Array of improvement suggestions
  ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
  target_role TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can view their own resume analyses"
  ON public.resume_analyses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can create their own resume analyses"
  ON public.resume_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own resume analyses" ON public.resume_analyses;
CREATE POLICY "Users can delete their own resume analyses"
  ON public.resume_analyses FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Placement officers can view all resume analyses" ON public.resume_analyses;
CREATE POLICY "Placement officers can view all resume analyses"
  ON public.resume_analyses FOR SELECT
  USING (get_user_role(auth.uid()) = 'PLACEMENT_OFFICER');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_date ON public.resume_analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_score ON public.resume_analyses(overall_score);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - COMMENTED OUT)
-- ============================================================================
-- Uncomment and modify these INSERTs after creating users via Supabase Auth
-- Replace UUIDs with actual user IDs from auth.users table

/*
-- Sample Student Profile
INSERT INTO public.profiles (id, email, name, role, department, phone)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'student@demo.com',
  'Demo Student',
  'STUDENT',
  'Computer Science',
  '+91-9876543210'
);

INSERT INTO public.student_profiles (id, major, year, semester, cgpa, skills, preferences)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Computer Science & Engineering',
  3,
  6,
  8.2,
  '[
    {"name": "JavaScript", "level": "Advanced", "verified": true},
    {"name": "React", "level": "Advanced", "verified": true},
    {"name": "Node.js", "level": "Intermediate", "verified": true},
    {"name": "Python", "level": "Intermediate", "verified": false},
    {"name": "SQL", "level": "Intermediate", "verified": false}
  ]'::jsonb,
  '{
    "industries": ["Technology", "Startups", "Finance"],
    "locations": ["Bangalore", "Hyderabad", "Remote"],
    "stipendRange": {"min": 20000, "max": 50000},
    "opportunityTypes": ["INTERNSHIP", "PLACEMENT"]
  }'::jsonb
);

-- Sample Placement Officer Profile
INSERT INTO public.profiles (id, email, name, role, department, phone)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'placement@demo.com',
  'Demo Placement Officer',
  'PLACEMENT_OFFICER',
  'Computer Science',
  '+91-9876543211'
);

-- Sample Opportunities
INSERT INTO public.opportunities (
  id, title, description, type, company_name, application_url, 
  posted_by, department, required_skills, min_cgpa, stipend_min, stipend_max, 
  location, duration, deadline, status, slots
)
VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'Full Stack Developer Intern',
    'Build modern web applications using React, Node.js, and PostgreSQL. Work on real-world projects with our engineering team.',
    'INTERNSHIP',
    'TechCorp Solutions',
    'https://careers.techcorp.com/fullstack-intern',
    '00000000-0000-0000-0000-000000000002',
    'Computer Science',
    '["React", "Node.js", "JavaScript", "PostgreSQL", "REST API"]'::jsonb,
    7.0,
    30000,
    40000,
    'Bangalore',
    '6 months',
    NOW() + INTERVAL '30 days',
    'active',
    10
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Software Development Engineer',
    'Join our product engineering team to design and build scalable microservices.',
    'PLACEMENT',
    'InnovateLabs',
    'https://careers.innovatelabs.com/sde',
    '00000000-0000-0000-0000-000000000002',
    'Computer Science',
    '["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes", "AWS"]'::jsonb,
    8.0,
    800000,
    1200000,
    'Bangalore',
    'Full-time',
    NOW() + INTERVAL '20 days',
    'active',
    5
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Data Science Intern',
    'Work on machine learning models and data analysis projects using Python and modern ML frameworks.',
    'INTERNSHIP',
    'DataFlow Systems',
    'https://careers.dataflow.com/ds-intern',
    '00000000-0000-0000-0000-000000000002',
    'Computer Science',
    '["Python", "Machine Learning", "Pandas", "NumPy", "TensorFlow"]'::jsonb,
    7.5,
    25000,
    35000,
    'Hyderabad',
    '4 months',
    NOW() + INTERVAL '15 days',
    'active',
    8
  );

-- Sample Application
INSERT INTO public.applications (
  opportunity_id, student_id, status, cover_letter
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'PENDING',
  'I am excited to apply for the Full Stack Developer Intern position. With my experience in React and Node.js, I am confident I can contribute effectively to your team.'
);

-- Sample Calendar Event
INSERT INTO public.calendar_events (
  title, description, event_type, start_date, end_date,
  opportunity_id, created_by
)
VALUES (
  'TechCorp Interview Drive',
  'Campus recruitment drive for Full Stack Developer Intern positions',
  'DRIVE',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

-- Sample Notification
INSERT INTO public.notifications (
  user_id, title, message, type, related_id, related_type
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'New Opportunity Posted',
  'A new internship opportunity at TechCorp Solutions has been posted.',
  'new_opportunity',
  '10000000-0000-0000-0000-000000000001',
  'opportunity'
);
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  • profiles (user accounts)';
  RAISE NOTICE '  • student_profiles (student-specific data)';
  RAISE NOTICE '  • opportunities (job postings)';
  RAISE NOTICE '  • applications (student applications)';
  RAISE NOTICE '  • notifications (system notifications)';
  RAISE NOTICE '  • rejection_analyses (AI rejection analysis)';
  RAISE NOTICE '  • calendar_events (events & deadlines)';
  RAISE NOTICE '  • event_reminders (user reminders)';
  RAISE NOTICE '  • resume_analyses (resume analysis data)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Create users via Supabase Auth (signup page)';
  RAISE NOTICE '  2. Users will automatically get profile entries';
  RAISE NOTICE '  3. Students can complete their profile setup';
END $$;
