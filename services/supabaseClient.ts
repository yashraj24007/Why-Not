import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a placeholder client for development if credentials are missing
const isDevelopment = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('placeholder') || 
  supabaseAnonKey.includes('placeholder');

export const supabase = isDevelopment
  ? createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjU0MDAsImV4cCI6MTk2MDcwMTQwMH0.placeholder'
    )
  : createClient(supabaseUrl, supabaseAnonKey);

console.log(isDevelopment ? '⚠️  Running in development mode without Supabase' : '✓ Supabase connected');
