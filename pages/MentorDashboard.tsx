import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import ApprovalCard from '../components/ApprovalCard';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'mentees' | 'history'>('pending');
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        // Fetch pending approvals (applications waiting for mentor approval)
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            opportunity:opportunities(title, company_name, type),
            student:profiles!applications_student_id_fkey(name, email, department)
          `)
          .eq('mentor_id', user!.id)
          .eq('status', 'PENDING_APPROVAL')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingApprovals(data || []);
      } else if (activeTab === 'mentees') {
        // Fetch all students assigned to this mentor
        const { data, error } = await supabase
          .from('applications')
          .select(`
            student_id,
            student:profiles!applications_student_id_fkey(
              id,
              name,
              email,
              department,
              student_profile:student_profiles(cgpa, year, semester)
            )
          `)
          .eq('mentor_id', user!.id);

        if (error) throw error;

        // Get unique students
        const uniqueStudents = Array.from(
          new Map(data?.map(item => [item.student_id, item.student]) || []).values()
        );
        setMentees(uniqueStudents);
      } else if (activeTab === 'history') {
        // Fetch approval history
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            opportunity:opportunities(title, company_name),
            student:profiles!applications_student_id_fkey(name, email)
          `)
          .eq('mentor_id', user!.id)
          .in('status', ['APPLIED', 'REJECTED'])
          .order('updated_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setApprovalHistory(data || []);
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalComplete = () => {
    fetchData(); // Refresh the list
  };

  // Count stats
  const pendingCount = pendingApprovals.length;
  const menteesCount = mentees.length;
  const approvedCount = approvalHistory.filter(a => a.mentor_approved).length;

  return (
    <PageTransition>
      <div className="min-h-screen pt-8 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Faculty Mentor Dashboard</h1>
            <p className="text-slate-400">Guide and approve your mentees' career decisions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="text-amber-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pending Approvals</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
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
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">My Mentees</p>
                  <p className="text-2xl font-bold">{menteesCount}</p>
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
                  <CheckCircle className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Approved</p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 px-2 transition-colors ${
                activeTab === 'pending'
                  ? 'text-neon-blue border-b-2 border-neon-blue'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Approvals ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('mentees')}
              className={`pb-4 px-2 transition-colors ${
                activeTab === 'mentees'
                  ? 'text-neon-blue border-b-2 border-neon-blue'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Mentees ({menteesCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-2 transition-colors ${
                activeTab === 'history'
                  ? 'text-neon-blue border-b-2 border-neon-blue'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              History
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
            </div>
          ) : (
            <>
              {/* Pending Approvals Tab */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No pending approvals</p>
                    </div>
                  ) : (
                    pendingApprovals.map((application) => (
                      <ApprovalCard
                        key={application.id}
                        application={application}
                        onApprovalComplete={handleApprovalComplete}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Mentees Tab */}
              {activeTab === 'mentees' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentees.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No mentees assigned yet</p>
                    </div>
                  ) : (
                    mentees.map((mentee: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6 hover:border-neon-blue/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                              {mentee.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold">{mentee.name}</h3>
                            <p className="text-sm text-slate-400">{mentee.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Department:</span>
                            <span>{mentee.department || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">CGPA:</span>
                            <span>{mentee.student_profile?.cgpa || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Year:</span>
                            <span>{mentee.student_profile?.year || 'N/A'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Student</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Opportunity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvalHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No approval history yet</p>
                          </td>
                        </tr>
                      ) : (
                        approvalHistory.map((app, index) => (
                          <tr key={index} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4">{app.student?.name}</td>
                            <td className="py-3 px-4">{app.opportunity?.title}</td>
                            <td className="py-3 px-4 text-slate-400">{app.opportunity?.company_name}</td>
                            <td className="py-3 px-4">
                              {app.mentor_approved ? (
                                <span className="flex items-center gap-1 text-emerald-400">
                                  <CheckCircle size={16} />
                                  Approved
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-rose-400">
                                  <XCircle size={16} />
                                  Rejected
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(app.updated_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MentorDashboard;
