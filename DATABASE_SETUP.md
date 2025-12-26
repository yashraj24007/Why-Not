# Database Setup Guide

## Issue: Missing `application_url` Column

If you encounter the error: **"Could not find the 'application_url' column of 'opportunities' in the schema cache"**

This means your database schema is missing a column. Follow these steps to fix it:

### Option 1: Run the Migration (Recommended)

Run this SQL in your Supabase SQL Editor:

```sql
-- Add the missing column
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS application_url TEXT;
```

Or use the migration file: `src/lib/add_application_url_column.sql`

### Option 2: Complete Database Setup

If you're setting up from scratch, run the complete schema:

1. Go to your Supabase Dashboard → SQL Editor
2. Run the SQL from: `src/lib/setup.sql`
3. Run the storage setup: `src/lib/storage_setup.sql`

**⚠️ Warning:** This will DROP all existing tables and data!

### How the App Handles This

The application has been updated to gracefully handle the missing column:

- **Application URL is now optional** - not required for posting opportunities
- **Internal application tracking** - works even without external URLs
- **Backward compatible** - supports both old and new database schemas

### What Changed

1. **PostOpportunityPage**: Application URL is no longer a required field
2. **OpportunitiesPage**: Uses internal application system first, external URL is optional
3. **Database Schema**: `application_url` column is now optional (can be NULL)

### Database Schema Overview

```
profiles (base user info)
  ├── student_profiles (student-specific data)
  └── opportunities (job postings)
        └── applications (student applications)
              ├── rejection_analyses (AI feedback)
              └── calendar_events (interviews/deadlines)

Additional tables:
- notifications (real-time updates)
- resume_analyses (resume feedback)
- event_reminders (calendar notifications)
```

### Quick Fix Commands

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
AND table_schema = 'public';

-- Add missing column
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS application_url TEXT;

-- Verify the fix
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
AND column_name = 'application_url';
```

### Testing

After running the migration:

1. Restart your dev server: `npm run dev`
2. Try posting a new opportunity
3. Try applying to an opportunity
4. Check that applications are tracked correctly

### Support

If issues persist:
1. Check Supabase logs for RLS policy errors
2. Verify your database user has proper permissions
3. Ensure all tables were created successfully
4. Check that RLS policies are enabled
