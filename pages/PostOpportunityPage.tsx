import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

const PostOpportunityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    company_name: '',
    department: '',
    required_skills: '',
    min_cgpa: '',
    stipend_min: '',
    stipend_max: '',
    location: '',
    duration: '',
    deadline: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Parse skills
      const skills = formData.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(name => ({ name, level: 'Intermediate' }));

      const opportunityData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        company_name: formData.company_name,
        posted_by: user!.id,
        department: formData.department,
        required_skills: skills,
        min_cgpa: parseFloat(formData.min_cgpa),
        stipend_min: parseInt(formData.stipend_min),
        stipend_max: parseInt(formData.stipend_max),
        location: formData.location,
        duration: formData.duration,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        status: 'ACTIVE'
      };

      const { error } = await supabase
        .from('opportunities')
        .insert(opportunityData);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Opportunity posted successfully!' });
      setTimeout(() => {
        navigate('/placement/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error posting opportunity:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to post opportunity' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-4xl mx-auto min-h-screen pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Briefcase className="text-neon-blue" />
            Post New Opportunity
          </h1>
          <p className="text-slate-400">Create an internship or placement opportunity for students</p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-xl border border-white/10 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Frontend Developer Intern"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Opportunity Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="PLACEMENT">Placement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="e.g., TechCorp Solutions"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Required Skills (comma-separated)</label>
            <input
              type="text"
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              placeholder="e.g., React, TypeScript, Node.js"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Min CGPA</label>
              <input
                type="number"
                step="0.1"
                name="min_cgpa"
                value={formData.min_cgpa}
                onChange={handleChange}
                placeholder="e.g., 7.5"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Min Stipend (₹)</label>
              <input
                type="number"
                name="stipend_min"
                value={formData.stipend_min}
                onChange={handleChange}
                placeholder="e.g., 15000"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Stipend (₹)</label>
              <input
                type="number"
                name="stipend_max"
                value={formData.stipend_max}
                onChange={handleChange}
                placeholder="e.g., 25000"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 6 Months"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Post Opportunity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default PostOpportunityPage;
