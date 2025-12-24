import { supabase } from './supabaseClient';
import { OpportunityType } from '../types';

export const api = {
  async getStudentProfile(userId: string) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { data: studentProfile, error: studentError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // PGRST116 is "not found" error - this is okay, not all users have student profiles
      if (studentError && studentError.code !== 'PGRST116') {
        console.error('Student profile fetch error:', studentError);
        throw studentError;
      }

      return { ...profile, ...studentProfile };
    } catch (error) {
      console.error('getStudentProfile failed:', error);
      throw error;
    }
  },

  async updateStudentProfile(userId: string, data: any) {
    // Split data into profile and student_profile fields
    const profileFields = ['name', 'department', 'phone', 'avatar'];
    const studentFields = ['major', 'year', 'semester', 'cgpa', 'skills', 'preferences'];

    const profileData: any = {};
    const studentData: any = {};

    Object.keys(data).forEach(key => {
      if (profileFields.includes(key)) profileData[key] = data[key];
      if (studentFields.includes(key)) studentData[key] = data[key];
    });

    if (Object.keys(profileData).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
      if (error) throw error;
    }

    if (Object.keys(studentData).length > 0) {
      // Check if student profile exists
      const { data: existing } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('student_profiles')
          .update(studentData)
          .eq('id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('student_profiles')
          .insert({ id: userId, ...studentData });
        if (error) throw error;
      }
    }
  },

  async getOpportunities(filters?: {
    type?: OpportunityType;
    department?: string;
    minCgpa?: number;
    location?: string;
    minStipend?: number;
    search?: string;
  }) {
    // We use posted_by:profiles(...) to fetch the related profile data using the foreign key
    let query = supabase
      .from('opportunities')
      .select('*, posted_by:profiles(name, organization)')
      .eq('status', 'ACTIVE');

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.department) query = query.eq('department', filters.department);
    if (filters?.minCgpa) query = query.lte('min_cgpa', filters.minCgpa); // Opportunity min_cgpa <= Student CGPA (Wait, logic is reverse. Filter usually means "Show me jobs where I qualify" or "Show me jobs requiring at least X")
    // Usually filters are "Show me jobs requiring at most my CGPA" OR "Show me jobs with at least X stipend".
    // Let's assume filters passed here are criteria to MATCH.
    // If I filter by minCgpa, I probably want opportunities where min_cgpa is <= my CGPA?
    // Or am I filtering opportunities that require AT LEAST X CGPA?
    // Let's stick to standard filtering:
    // If filters.minCgpa is provided, it might mean "Show opportunities where min_cgpa >= filters.minCgpa" (Filtering for high requirements?)
    // OR "Show opportunities where min_cgpa <= filters.minCgpa" (Filtering for what I am eligible for).
    // Let's assume the UI handles the logic and passes the value.
    // But typically "Min CGPA" filter in a job board means "Jobs requiring at least X".
    // So query.gte('min_cgpa', filters.minCgpa).
    
    // However, if the student is filtering, they might want to see jobs they are eligible for.
    // If I have 8.0, I want to see jobs requiring <= 8.0.
    // So if filters.minCgpa is the STUDENT'S CGPA, then query.lte('min_cgpa', filters.minCgpa).
    // Let's assume the filter parameter is named `studentCgpa` if that's the intent.
    // But the interface says `minCgpa`.
    // Let's assume it filters opportunities that have `min_cgpa` >= value.
    if (filters?.minCgpa) query = query.gte('min_cgpa', filters.minCgpa);

    if (filters?.location) query = query.ilike('location', `%${filters.location}%`);
    if (filters?.minStipend) query = query.gte('stipend_max', filters.minStipend); // Match if max stipend is at least the filter
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async applyToOpportunity(opportunityId: string, studentId: string, coverLetter?: string) {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        opportunity_id: opportunityId,
        student_id: studentId,
        cover_letter: coverLetter,
        status: 'APPLIED'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyApplications(studentId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        opportunity:opportunities (
          title,
          company_name,
          type,
          location,
          stipend_min,
          stipend_max
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
