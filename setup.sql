-- ============================================================================
-- CLEANUP: Drop existing tables and policies
-- ============================================================================
-- This ensures a clean slate for schema updates
-- WARNING: This will delete all existing data!

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Note: Test user account must be created via Supabase Auth signup
-- Email: tester@test.com
-- Password: 12345678
-- The profile and student_profile will be auto-created on first login

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile creation during signup (more permissive for signup flow)
CREATE POLICY "Allow profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  major TEXT,
  year INTEGER,
  semester INTEGER,
  cgpa DECIMAL(4,2),
  resume_url TEXT,
  cover_letter TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile if it doesn't exist (more permissive for initial setup)
-- This is redundant with the above if auth.uid() is correctly set, but sometimes helpful for debugging
-- CREATE POLICY "Allow insert for authenticated users"
--   ON public.student_profiles FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Placement officers can view all student profiles"
  ON public.student_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'PLACEMENT_OFFICER'
    )
  );

CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INTERNSHIP', 'PLACEMENT')),
  company_name TEXT NOT NULL,
  posted_by UUID REFERENCES public.profiles(id),
  department TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  min_cgpa DECIMAL(3,2),
  stipend_min INTEGER,
  stipend_max INTEGER,
  location TEXT,
  duration TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DRAFT')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active opportunities"
  ON public.opportunities FOR SELECT
  USING (status = 'ACTIVE' OR posted_by = auth.uid());

CREATE POLICY "Placement officers can create opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'PLACEMENT_OFFICER'
    )
  );

CREATE POLICY "Creators can update their opportunities"
  ON public.opportunities FOR UPDATE
  USING (posted_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'OFFERED', 'ACCEPTED', 'COMPLETED')),
  cover_letter TEXT,
  rejection_reason TEXT,
  interview_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, student_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own applications"
  ON public.applications FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Placement officers can view all applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'PLACEMENT_OFFICER'
    )
  );

CREATE POLICY "Placement officers can update applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'PLACEMENT_OFFICER'
    )
  );

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('application_status', 'new_opportunity', 'interview_scheduled', 'profile_update', 'general')),
  read BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TEST DATA SEEDS (OPTIONAL)
-- ============================================================================
-- NOTE: These INSERT statements are COMMENTED OUT by default.
-- To use test data:
-- 1. First, sign up users through the app's signup page (e.g., student@demo.com, placement@demo.com)
-- 2. Get their UUIDs from the Supabase Auth dashboard
-- 3. Replace the UUIDs below and uncomment the sections you need
-- 4. Run only the relevant INSERT statements

-- IMPORTANT: Tables are created above. You can now:
-- - Sign up new users through the app
-- - Users will automatically get profile entries
-- - Create opportunities through the app UI

/*
-- Test Student Profile (UNCOMMENT AFTER CREATING AUTH USER)
INSERT INTO public.profiles (id, email, name, role, department, phone)
VALUES (
  'REPLACE_WITH_ACTUAL_UUID',
  'student@demo.com',
  'Demo Student',
  'STUDENT',
  'Computer Science',
  '+91-9876543210'
);

INSERT INTO public.student_profiles (id, major, year, semester, cgpa, skills, preferences)
VALUES (
  'REPLACE_WITH_ACTUAL_UUID',
  'Computer Science & Engineering',
  3,
  6,
  7.8,
  '[
    {"name": "JavaScript", "level": "Advanced", "verified": true},
    {"name": "React", "level": "Intermediate", "verified": true},
    {"name": "Python", "level": "Intermediate", "verified": false},
    {"name": "SQL", "level": "Beginner", "verified": false}
  ]'::jsonb,
  '{
    "industries": ["Technology", "Startups", "Finance"],
    "locations": ["Bangalore", "Hyderabad", "Remote"],
    "stipendRange": {"min": 15000, "max": 50000},
    "opportunityTypes": ["INTERNSHIP", "PLACEMENT"]
  }'::jsonb
);

-- Sample Opportunities (UNCOMMENT IF NEEDED)
INSERT INTO public.opportunities (id, title, description, type, company_name, department, required_skills, min_cgpa, stipend_min, stipend_max, location, duration, deadline, status)
VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'Frontend Developer Intern',
    'Build amazing user interfaces with React and TypeScript. Work on real projects with our product team.',
    'INTERNSHIP',
    'TechCorp Solutions',
    'Computer Science',
    '["React", "JavaScript", "TypeScript", "HTML", "CSS"]'::jsonb,
    7.0,
    25000,
    35000,
    'Bangalore',
    '6 months',
    NOW() + INTERVAL '30 days',
    'ACTIVE'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Backend Developer Intern',
    'Design and implement RESTful APIs using Node.js and PostgreSQL. Learn microservices architecture.',
    'INTERNSHIP',
    'DataFlow Systems',
    'Computer Science',
    '["Node.js", "PostgreSQL", "REST API", "Docker", "AWS"]'::jsonb,
    7.5,
    30000,
    40000,
    'Hyderabad',
    '6 months',
    NOW() + INTERVAL '25 days',
    'ACTIVE'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Full Stack Developer',
    'Join our engineering team to build scalable web applications. Work with modern tech stack.',
    'PLACEMENT',
    'InnovateLabs',
    'Computer Science',
    '["React", "Node.js", "MongoDB", "TypeScript", "Docker"]'::jsonb,
    8.0,
    600000,
    800000,
    'Bangalore',
    'Full-time',
    NOW() + INTERVAL '20 days',
    'ACTIVE'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Python Developer Intern',
    'Work on data processing pipelines and automation tools using Python and modern frameworks.',
    'INTERNSHIP',
    'AutomateNow',
    'Computer Science',
    '["Python", "Django", "PostgreSQL", "Redis", "Celery"]'::jsonb,
    7.0,
    20000,
    30000,
    'Remote',
    '3 months',
    NOW() + INTERVAL '15 days',
    'ACTIVE'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Machine Learning Engineer',
    'Build and deploy ML models for production systems. Experience with TensorFlow and PyTorch required.',
    'PLACEMENT',
    'AI Dynamics',
    'Computer Science',
    '["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "AWS"]'::jsonb,
    8.5,
    1000000,
    1400000,
    'Bangalore',
    'Full-time',
    NOW() + INTERVAL '10 days',
    'ACTIVE'
  );

-- Sample Applications (UNCOMMENT IF NEEDED)
INSERT INTO public.applications (id, opportunity_id, student_id, status, cover_letter, rejection_reason)
VALUES 
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'REPLACE_WITH_ACTUAL_UUID',
    'SHORTLISTED',
    'I am excited to apply for this position as I have been working with React for over a year...',
    NULL
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000004',
    'REPLACE_WITH_ACTUAL_UUID',
    'INTERVIEW_SCHEDULED',
    'My experience with Python and passion for automation makes me a great fit for this role...',
    NULL
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000005',
    'REPLACE_WITH_ACTUAL_UUID',
    'REJECTED',
    'I am deeply interested in machine learning and have completed several online courses...',
    'While your foundational programming skills are strong, this role requires advanced expertise in TensorFlow, PyTorch, and production ML systems. Your current skill set (JavaScript, React, basic Python) shows great web development capability, but lacks the specialized ML frameworks and deep learning experience needed. Additionally, the role requires a minimum CGPA of 8.5, and your current 7.8 CGPA, while respectable, does not meet this threshold. We recommend completing advanced ML certifications, building ML projects using TensorFlow/PyTorch, and focusing on improving your academic performance to strengthen future applications.'
  );
*/

