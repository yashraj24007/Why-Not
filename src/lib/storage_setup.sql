-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================
-- Run this script in your Supabase SQL Editor to set up the storage bucket
-- for resume uploads.
-- ============================================================================

-- 1. Create the 'resumes' bucket
-- We make it public so that getPublicUrl returns a usable link
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up security policies
-- Enable RLS on objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
-- This allows any logged-in user to upload to the 'resumes' bucket
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resumes' );

-- Policy: Allow public access to view files
-- Required because we use getPublicUrl() which generates public links
CREATE POLICY "Public can view resumes"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'resumes' );

-- Policy: Allow users to delete their own files
-- Assumes files are stored as "userId/filename"
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text 
);

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text 
)
WITH CHECK ( 
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text 
);
