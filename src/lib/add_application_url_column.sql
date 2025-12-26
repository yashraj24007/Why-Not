-- ============================================================================
-- MIGRATION: Add application_url column to opportunities table
-- ============================================================================
-- This migration adds the application_url column to the opportunities table
-- Run this in your Supabase SQL Editor if the column doesn't exist
-- ============================================================================

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'opportunities' 
        AND column_name = 'application_url'
    ) THEN
        ALTER TABLE public.opportunities 
        ADD COLUMN application_url TEXT;
        
        RAISE NOTICE 'Column application_url added successfully';
    ELSE
        RAISE NOTICE 'Column application_url already exists';
    END IF;
END $$;

-- Optional: Update existing records with a placeholder if needed
-- UPDATE public.opportunities 
-- SET application_url = 'https://example.com/apply'
-- WHERE application_url IS NULL;
