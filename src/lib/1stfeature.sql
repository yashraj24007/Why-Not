-- ============================================================================
-- CAREER PATH SIMULATOR FEATURE - DATABASE SETUP
-- ============================================================================
-- This script adds support for the Career Path Simulator feature
-- - Simulation history tracking
-- - User simulation preferences
-- - Simulation analytics
--
-- USAGE: Run this script in your Supabase SQL editor
-- SAFE TO RUN: Uses IF NOT EXISTS to prevent conflicts
-- ============================================================================

-- ============================================================================
-- CAREER SIMULATION HISTORY TABLE
-- ============================================================================
-- Stores all simulations run by students to track their career planning journey
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.career_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Simulation Input Data
  original_cgpa DECIMAL(3,2),
  original_skills JSONB DEFAULT '[]'::jsonb,
  simulation_changes JSONB NOT NULL, -- Array of changes: [{type, value, level}]
  
  -- Simulation Results
  current_opportunities INTEGER NOT NULL DEFAULT 0,
  new_opportunities INTEGER NOT NULL DEFAULT 0,
  total_opportunities INTEGER GENERATED ALWAYS AS (current_opportunities + new_opportunities) STORED,
  match_score_improvements JSONB DEFAULT '[]'::jsonb, -- Array of company improvements
  unlocked_features JSONB DEFAULT '[]'::jsonb, -- Array of strings
  recommended_path JSONB DEFAULT '[]'::jsonb, -- Array of recommended actions
  timeline JSONB DEFAULT '[]'::jsonb, -- Array of timeline items
  
  -- Metadata
  simulation_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_cgpa CHECK (original_cgpa >= 0 AND original_cgpa <= 10),
  CONSTRAINT valid_opportunities CHECK (current_opportunities >= 0 AND new_opportunities >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_career_simulations_student_id 
  ON public.career_simulations(student_id);

CREATE INDEX IF NOT EXISTS idx_career_simulations_date 
  ON public.career_simulations(simulation_date DESC);

CREATE INDEX IF NOT EXISTS idx_career_simulations_student_date 
  ON public.career_simulations(student_id, simulation_date DESC);

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_career_simulations_updated_at ON public.career_simulations;
CREATE TRIGGER update_career_simulations_updated_at
  BEFORE UPDATE ON public.career_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.career_simulations ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own simulation history
DROP POLICY IF EXISTS "Students can view their own simulations" ON public.career_simulations;
CREATE POLICY "Students can view their own simulations"
  ON public.career_simulations FOR SELECT
  USING (auth.uid() = student_id);

-- Policy: Students can insert their own simulations
DROP POLICY IF EXISTS "Students can create simulations" ON public.career_simulations;
CREATE POLICY "Students can create simulations"
  ON public.career_simulations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Students can update their own simulations (for notes/bookmarks)
DROP POLICY IF EXISTS "Students can update their own simulations" ON public.career_simulations;
CREATE POLICY "Students can update their own simulations"
  ON public.career_simulations FOR UPDATE
  USING (auth.uid() = student_id);

-- Policy: Students can delete their own simulations
DROP POLICY IF EXISTS "Students can delete their own simulations" ON public.career_simulations;
CREATE POLICY "Students can delete their own simulations"
  ON public.career_simulations FOR DELETE
  USING (auth.uid() = student_id);

-- Policy: Placement officers can view all simulations for analytics
DROP POLICY IF EXISTS "Placement officers can view all simulations" ON public.career_simulations;
CREATE POLICY "Placement officers can view all simulations"
  ON public.career_simulations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'PLACEMENT_OFFICER'
    )
  );

-- ============================================================================
-- SIMULATION BOOKMARKS TABLE (OPTIONAL)
-- ============================================================================
-- Allows students to bookmark/favorite specific simulations for quick reference
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.simulation_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES public.career_simulations(id) ON DELETE CASCADE,
  bookmark_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one student can only bookmark a simulation once
  UNIQUE(student_id, simulation_id)
);

-- Create index for bookmarks
CREATE INDEX IF NOT EXISTS idx_simulation_bookmarks_student 
  ON public.simulation_bookmarks(student_id);

-- Enable RLS for bookmarks
ALTER TABLE public.simulation_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Students can manage their own bookmarks
DROP POLICY IF EXISTS "Students can view their own bookmarks" ON public.simulation_bookmarks;
CREATE POLICY "Students can view their own bookmarks"
  ON public.simulation_bookmarks FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can create bookmarks" ON public.simulation_bookmarks;
CREATE POLICY "Students can create bookmarks"
  ON public.simulation_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their bookmarks" ON public.simulation_bookmarks;
CREATE POLICY "Students can update their bookmarks"
  ON public.simulation_bookmarks FOR UPDATE
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can delete their bookmarks" ON public.simulation_bookmarks;
CREATE POLICY "Students can delete their bookmarks"
  ON public.simulation_bookmarks FOR DELETE
  USING (auth.uid() = student_id);

-- ============================================================================
-- USEFUL VIEWS (OPTIONAL)
-- ============================================================================

-- View: Recent simulations with summary stats
CREATE OR REPLACE VIEW public.recent_simulations_summary AS
SELECT 
  cs.id,
  cs.student_id,
  p.name as student_name,
  cs.original_cgpa,
  jsonb_array_length(cs.simulation_changes) as changes_count,
  cs.new_opportunities,
  cs.total_opportunities,
  cs.simulation_date,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.simulation_bookmarks 
      WHERE simulation_id = cs.id
    ) THEN true 
    ELSE false 
  END as is_bookmarked
FROM public.career_simulations cs
JOIN public.profiles p ON cs.student_id = p.id
ORDER BY cs.simulation_date DESC;

-- Grant access to the view
GRANT SELECT ON public.recent_simulations_summary TO authenticated;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get student's simulation statistics
CREATE OR REPLACE FUNCTION get_student_simulation_stats(student_uuid UUID)
RETURNS TABLE(
  total_simulations BIGINT,
  avg_new_opportunities NUMERIC,
  max_opportunities INTEGER,
  most_recent_simulation TIMESTAMPTZ,
  total_bookmarks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(cs.id)::BIGINT as total_simulations,
    AVG(cs.new_opportunities)::NUMERIC as avg_new_opportunities,
    MAX(cs.total_opportunities)::INTEGER as max_opportunities,
    MAX(cs.simulation_date) as most_recent_simulation,
    COUNT(DISTINCT sb.id)::BIGINT as total_bookmarks
  FROM public.career_simulations cs
  LEFT JOIN public.simulation_bookmarks sb ON cs.id = sb.simulation_id
  WHERE cs.student_id = student_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_student_simulation_stats(UUID) TO authenticated;

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - Comment out if not needed)
-- ============================================================================

-- Uncomment below to insert sample simulation data for testing
/*
-- Insert a sample simulation (replace with actual student UUID)
INSERT INTO public.career_simulations (
  student_id,
  original_cgpa,
  original_skills,
  simulation_changes,
  current_opportunities,
  new_opportunities,
  match_score_improvements,
  unlocked_features,
  recommended_path,
  timeline
) VALUES (
  'REPLACE-WITH-ACTUAL-STUDENT-UUID'::UUID,
  6.8,
  '[{"name": "Python", "level": "Intermediate"}, {"name": "HTML", "level": "Advanced"}]'::jsonb,
  '[{"type": "skill", "value": "SQL", "level": "Beginner"}, {"type": "cgpa", "value": "7.2"}]'::jsonb,
  7,
  8,
  '[{"company": "TCS", "before": 45, "after": 87}, {"company": "Infosys", "before": 36, "after": 72}]'::jsonb,
  '["Eligible for top-tier companies", "Match score for TCS: 45% → 87%"]'::jsonb,
  '[{"priority": 1, "action": "Add SQL (Beginner)", "effort": "4 weeks effort", "impact": "Unlocks 8 immediate opportunities"}]'::jsonb,
  '[{"week": "Week 1-4", "action": "SQL course + project"}, {"week": "Week 5", "action": "Apply to 8 newly matched roles"}]'::jsonb
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the setup was successful

-- Check if tables were created
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'career_simulations'
  ) THEN
    RAISE NOTICE '✓ Table career_simulations created successfully';
  END IF;
  
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'simulation_bookmarks'
  ) THEN
    RAISE NOTICE '✓ Table simulation_bookmarks created successfully';
  END IF;
END $$;

-- Check if indexes were created
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_indexes 
    WHERE indexname = 'idx_career_simulations_student_id'
  ) THEN
    RAISE NOTICE '✓ Indexes created successfully';
  END IF;
END $$;

-- Check if RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'career_simulations' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✓ Row Level Security enabled successfully';
  END IF;
END $$;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- The Career Path Simulator feature database setup is complete!
-- 
-- Tables created:
--   - career_simulations: Stores simulation history
--   - simulation_bookmarks: Stores bookmarked simulations
--
-- Features enabled:
--   - Row Level Security for data protection
--   - Indexes for query performance
--   - Helper functions for analytics
--   - Triggers for automatic timestamp updates
--
-- Next steps:
--   1. Update your frontend API calls to save simulations
--   2. Add simulation history view to the UI
--   3. Implement bookmark functionality (optional)
-- ============================================================================
