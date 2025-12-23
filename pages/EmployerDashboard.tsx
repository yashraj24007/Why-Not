import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Calendar, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch employer's opportunities
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id, status')
        .eq('posted_by', user!.id);

      if (oppError) throw oppError;

      const activeJobs = opportunities?.filter(o => o.status === 'ACTIVE').length || 0;
      const opportunityIds = opportunities?.map(o => o.id) || [];

      // Fetch applications for employer's opportunities
      if (opportunityIds.length > 0) {
        const { data: applications, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            opportunity:opportunities(title, company_name),
            student:profiles!applications_student_id_fkey(name, email, department)
          `)
          .in('opportunity_id', opportunityIds)
          .order('created_at', { ascending: false })
          .limit(10);

        if (appError) throw appError;

        const totalApplications = applications?.length || 0;
        const shortlisted = applications?.filter(a => a.status === 'SHORTLISTED').length || 0;
        const interviews = applications?.filter(a => a.status === 'INTERVIEW_SCHEDULED').length || 0;

        setStats({
          activeJobs,
          totalApplications,
          shortlisted,
          interviews
        });

        setRecentApplications(applications || []);
      } else {
        setStats({ activeJobs: 0, totalApplications: 0, shortlisted: 0, interviews: 0 });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      APPLIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SHORTLISTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      INTERVIEW_SCHEDULED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      OFFERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">Employer Dashboard</h1>
              <p className="text-slate-400">Manage your job postings and candidate pipeline</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/employer/candidates')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Users size={20} />
                Browse Candidates
              </button>
              <button
                onClick={() => navigate('/employer/post')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg hover:scale-105 transition-transform"
              >
                <Plus size={20} />
                Post Job
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Briefcase className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Active Jobs</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Shortlisted</p>
                  <p className="text-2xl font-bold">{stats.shortlisted}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Calendar className="text-amber-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-6">Recent Applications</h2>
            
            {recentApplications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No applications yet</p>
                <p className="text-sm mt-2">Post a job to start receiving applications</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Candidate</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Position</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Department</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app, index) => (
                      <tr 
                        key={index}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/employer/applications/${app.id}`)}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{app.student.name}</p>
                            <p className="text-sm text-slate-400">{app.student.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{app.opportunity.title}</td>
                        <td className="py-3 px-4 text-slate-400">{app.student.department}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default EmployerDashboard;
