import { supabase } from './supabaseClient';
import { OpportunityType } from '../types';

export const api = {
  async getStudentProfile(userId: string) {
    try {
      // Fetch base profile first
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        throw new Error('Profile not found');
      }

      const profile = profiles[0];

      // Fetch student profile separately if needed
      let studentData = {};
      if (profile.role === 'STUDENT') {
        const { data: studentProfiles, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId);
          
        if (studentProfiles && studentProfiles.length > 0) {
          studentData = studentProfiles[0];
        }
      }

      return { ...profile, ...studentData };
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
      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('student_profiles')
        .upsert({ id: userId, ...studentData }, { onConflict: 'id' });
      
      if (error) {
        console.error('Student profile upsert error:', error);
        throw error;
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
      .eq('status', 'active');

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.department) query = query.eq('department', filters.department);
    // Filter by student CGPA: show opportunities where the student is eligible (opportunity min_cgpa <= student's CGPA)
    if (filters?.minCgpa) query = query.lte('min_cgpa', filters.minCgpa);

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
        status: 'PENDING'
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
          stipend_max,
          description,
          required_skills,
          min_cgpa
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
