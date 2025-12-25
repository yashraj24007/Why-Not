import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, TrendingUp, Calendar, PlusCircle, Clock, 
  CheckCircle, XCircle, FileText, ArrowRight, Award, Search,
  User, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import PageTransition from '../components/common/PageTransition';
import { Link } from 'react-router-dom';

const PlacementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalStudents: 0,
    placedStudents: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch opportunities stats
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, status')
        .eq('posted_by', user!.id);

      // Fetch applications for my opportunities
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          opportunity:opportunities!inner(title, posted_by),
          student:profiles!applications_student_id_fkey(name, email, avatar)
        `)
        .eq('opportunity.posted_by', user!.id)
        .order('created_at', { ascending: false });

      // Fetch student stats
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT');

      const { count: placedCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACCEPTED');

      setStats({
        totalOpportunities: opportunities?.length || 0,
        activeOpportunities: opportunities?.filter(o => o.status === 'ACTIVE').length || 0,
        totalApplications: applications?.length || 0,
        pendingApplications: applications?.filter(a => a.status === 'PENDING').length || 0,
        totalStudents: studentCount || 0,
        placedStudents: placedCount || 0
      });

      // Get recent applications
      setRecentApplications(applications?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Active Jobs', 
      value: stats.activeOpportunities, 
      icon: Briefcase, 
      color: 'text-purple-400',
      gradient: 'from-purple-500 to-indigo-500',
      change: `${stats.totalOpportunities} Total`
    },
    { 
      label: 'Applications', 
      value: stats.totalApplications, 
      icon: FileText, 
      color: 'text-rose-400',
      gradient: 'from-rose-500 to-pink-500',
      change: `${stats.pendingApplications} Pending`
    },
    { 
      label: 'Students Placed', 
      value: stats.placedStudents, 
      icon: Award, 
      color: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-500',
      change: 'Total Placed'
    },
    { 
      label: 'Total Students', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-500',
      change: 'Registered'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      SHORTLISTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      INTERVIEW_SCHEDULED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black relative overflow-hidden pt-28 pb-12">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Placement Dashboard</h1>
              <p className="text-slate-400 text-lg">Manage opportunities and track student progress</p>
            </div>
            <Link to="/placement/post">
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                <PlusCircle size={20} />
                Post Opportunity
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Stats Grid */}
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="col-span-12 sm:col-span-6 lg:col-span-3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative group h-full"
                  >
                    <div className={`absolute -inset-[1px] bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                    <div className="relative glass-panel rounded-2xl p-6 h-full hover:-translate-y-1 transition-transform duration-300 bg-slate-900/80">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-[1px]`}>
                          <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                        {stat.change && (
                          <span className={`px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300`}>
                            {stat.change}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-1 font-medium uppercase tracking-wide">{stat.label}</p>
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                  </motion.div>
                </div>
              ))}

              {/* Recent Applications - Large Card */}
              <div className="col-span-12 lg:col-span-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="glass-panel rounded-2xl p-6 h-full border border-white/10 bg-slate-900/60"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      Recent Applications
                    </h2>
                    <Link to="/placement/applications" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors text-sm font-semibold group">
                      View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {recentApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400">No applications received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentApplications.map((app, index) => (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-purple-500/30 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                              {app.student?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                                {app.student?.name || 'Unknown Student'}
                              </h4>
                              <p className="text-sm text-slate-400">
                                Applied for <span className="text-slate-300">{app.opportunity?.title}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-500 hidden sm:block">
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Quick Actions - Side Panel */}
              <div className="col-span-12 lg:col-span-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-slate-900/60">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      <Link to="/placement/post" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-purple-500/20 transition-all border border-white/5 hover:border-purple-500/50 group cursor-pointer">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:text-purple-300">
                          <PlusCircle size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Post Opportunity</h3>
                          <p className="text-xs text-slate-400">Create new job listing</p>
                        </div>
                      </Link>
                      
                      <Link to="/profile" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-indigo-500/20 transition-all border border-white/5 hover:border-indigo-500/50 group cursor-pointer">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300">
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">My Profile</h3>
                          <p className="text-xs text-slate-400">View and edit profile</p>
                        </div>
                      </Link>

                      <Link to="/help-center" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-rose-500/20 transition-all border border-white/5 hover:border-rose-500/50 group cursor-pointer">
                        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:text-rose-300">
                          <HelpCircle size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Help & Support</h3>
                          <p className="text-xs text-slate-400">Get assistance</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Mini Stats or Info */}
                  <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-purple-900/20 to-slate-900/60">
                    <h3 className="text-lg font-bold text-white mb-2">Placement Season</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Keep track of ongoing placement drives and student performance.
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Placement Rate</span>
                      <span className="text-emerald-400 font-bold">
                        {stats.totalStudents > 0 
                          ? Math.round((stats.placedStudents / stats.totalStudents) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                        style={{ width: `${stats.totalStudents > 0 ? (stats.placedStudents / stats.totalStudents) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PlacementDashboard;
