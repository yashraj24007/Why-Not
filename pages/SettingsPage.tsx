import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const seedOpportunities = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) throw new Error("You must be logged in to seed data.");

      // Fetch or create profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: 'Test User',
            role: 'STUDENT',
            department: 'Computer Science'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        profile = newProfile;
      }

      // Insert sample opportunities
      const opportunities = [
        {
          title: 'Frontend Developer Intern',
          description: 'We are looking for a React developer to join our team. You will work on building modern web applications using React, TypeScript, and Tailwind CSS. Perfect for students who want hands-on experience with production-grade systems.',
          type: 'INTERNSHIP',
          company_name: 'TechCorp Solutions',
          posted_by: profile.id,
          department: 'Computer Science',
          required_skills: [{ name: 'React', level: 'Intermediate' }, { name: 'TypeScript', level: 'Beginner' }, { name: 'Tailwind CSS', level: 'Beginner' }],
          min_cgpa: 7.5,
          stipend_min: 15000,
          stipend_max: 25000,
          location: 'Bangalore',
          duration: '6 Months',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        },
        {
          title: 'Data Science Intern',
          description: 'Join our AI team to work on cutting-edge machine learning models. Experience with Python and PyTorch is required. You will work on real-world datasets and deploy ML models to production.',
          type: 'INTERNSHIP',
          company_name: 'DataMinds AI',
          posted_by: profile.id,
          department: 'Computer Science',
          required_skills: [{ name: 'Python', level: 'Advanced' }, { name: 'Machine Learning', level: 'Intermediate' }, { name: 'PyTorch', level: 'Beginner' }],
          min_cgpa: 8.0,
          stipend_min: 20000,
          stipend_max: 35000,
          location: 'Remote',
          duration: '3 Months',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        },
        {
          title: 'Software Engineer (Fresher)',
          description: 'Full-time role for graduating students. Strong problem-solving skills and knowledge of data structures and algorithms required. Join a fast-paced startup environment with great learning opportunities.',
          type: 'PLACEMENT',
          company_name: 'InnovateX',
          posted_by: profile.id,
          department: 'Information Technology',
          required_skills: [{ name: 'Java', level: 'Intermediate' }, { name: 'Data Structures', level: 'Advanced' }, { name: 'Algorithms', level: 'Advanced' }],
          min_cgpa: 7.0,
          stipend_min: 50000,
          stipend_max: 70000,
          location: 'Hyderabad',
          duration: 'Full Time',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        },
        {
          title: 'Backend Developer Intern',
          description: 'Work with Node.js and Express to build scalable backend services. You will be involved in API design, database optimization, and microservices architecture.',
          type: 'INTERNSHIP',
          company_name: 'CloudScale Systems',
          posted_by: profile.id,
          department: 'Computer Science',
          required_skills: [{ name: 'Node.js', level: 'Intermediate' }, { name: 'Express', level: 'Beginner' }, { name: 'MongoDB', level: 'Beginner' }],
          min_cgpa: 7.0,
          stipend_min: 18000,
          stipend_max: 28000,
          location: 'Pune',
          duration: '6 Months',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        },
        {
          title: 'Full Stack Developer',
          description: 'Looking for a versatile developer comfortable with both frontend and backend technologies. MERN stack experience preferred. You will work on end-to-end feature development.',
          type: 'PLACEMENT',
          company_name: 'WebFlow Innovations',
          posted_by: profile.id,
          department: 'Computer Science',
          required_skills: [{ name: 'React', level: 'Advanced' }, { name: 'Node.js', level: 'Advanced' }, { name: 'MongoDB', level: 'Intermediate' }],
          min_cgpa: 7.5,
          stipend_min: 45000,
          stipend_max: 65000,
          location: 'Bangalore',
          duration: 'Full Time',
          deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        }
      ];

      const { error } = await supabase.from('opportunities').insert(opportunities);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: `Successfully seeded ${opportunities.length} opportunities! Go to Opportunities page to view them.` });
    } catch (error: any) {
      console.error('Error seeding data:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to seed data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-4xl mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and application settings.</p>
        </div>

        <div className="grid gap-8">
          {/* Developer Tools */}
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Database className="text-neon-blue" />
              Developer Tools
            </h3>
            <p className="text-slate-400 mb-6">
              Use these tools to populate your database with sample data for testing purposes.
            </p>

            {message && (
              <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={seedOpportunities}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} />}
                Seed Sample Opportunities
              </button>
            </div>
          </div>

          {/* Account Settings (Placeholder) */}
          <div className="glass-panel p-6 rounded-xl border border-white/10 opacity-50 pointer-events-none">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Save className="text-slate-400" />
              Account Settings
            </h3>
            <p className="text-slate-400">
              Change password, update email, and manage notifications. (Coming Soon)
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;