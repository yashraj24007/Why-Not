import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { notifyApplicationStatusChange } from '../services/notificationService';
import PageTransition from '../components/PageTransition';

const ApplicationsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, statusFilter]);

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          opportunity:opportunities!inner(title, company_name, posted_by),
          student:profiles!applications_student_id_fkey(name, email, department)
        `)
        .eq('opportunity.posted_by', user!.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      // Find the application to get student details
      const application = applications.find(app => app.id === appId);
      
      await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);
      
      // Send notification to student
      if (application) {
        await notifyApplicationStatusChange(
          application.student_id,
          application.opportunity.title,
          newStatus,
          appId
        );
        showToast('success', 'Status updated and notification sent');
      }
      
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('error', 'Failed to update status');
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

  const filteredApps = applications.filter(app =>
    app.student?.name.toLowerCase().includes(search.toLowerCase()) ||
    app.opportunity?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applications Management</h1>
          <p className="text-slate-400">Review and manage student applications</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or opportunity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-neon-blue text-black font-medium'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-xl">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Applications Found</h3>
            <p className="text-slate-400">No applications match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{app.student?.name}</h3>
                    <p className="text-slate-400 text-sm">{app.student?.email}</p>
                    <p className="text-slate-500 text-sm">{app.student?.department}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-1">Applied for:</p>
                  <p className="font-medium">{app.opportunity?.title} at {app.opportunity?.company_name}</p>
                </div>

                {app.cover_letter && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">Cover Letter:</p>
                    <p className="text-sm">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    Applied on {new Date(app.created_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex gap-2">
                    {app.status === 'APPLIED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                          className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm transition-colors"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'REJECTED')}
                          className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'SHORTLISTED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'INTERVIEW_SCHEDULED')}
                          className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm transition-colors"
                        >
                          Schedule Interview
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'REJECTED')}
                          className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'INTERVIEW_SCHEDULED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, 'OFFERED')}
                          className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm transition-colors"
                        >
                          Make Offer
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'REJECTED')}
                          className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ApplicationsManagementPage;
