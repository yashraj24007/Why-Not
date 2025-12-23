import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp, Calendar, PlusCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import PageTransition from '../components/PageTransition';
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
          opportunity:opportunities!inner(posted_by),
          student:profiles!applications_student_id_fkey(name, email)
        `)
        .eq('opportunity.posted_by', user!.id);

      // Fetch student stats
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT');

      const { count: placedCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'OFFERED');

      setStats({
        totalOpportunities: opportunities?.length || 0,
        activeOpportunities: opportunities?.filter(o => o.status === 'ACTIVE').length || 0,
        totalApplications: applications?.length || 0,
        pendingApplications: applications?.filter(a => a.status === 'APPLIED').length || 0,
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
      title: 'Active Opportunities', 
      value: stats.activeOpportunities, 
      total: stats.totalOpportunities,
      icon: Briefcase, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    { 
      title: 'Total Applications', 
      value: stats.totalApplications, 
      pending: stats.pendingApplications,
      icon: Users, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    { 
      title: 'Total Students', 
      value: stats.totalStudents, 
      placed: stats.placedStudents,
      icon: TrendingUp, 
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles: any = {
      APPLIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SHORTLISTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      INTERVIEW_SCHEDULED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      OFFERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Placement Officer Dashboard</h1>
            <p className="text-slate-400">Manage opportunities and track applications</p>
          </div>
          <Link to="/placement/post">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-medium hover:scale-105 transition-transform">
              <PlusCircle size={20} />
              Post Opportunity
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-panel p-6 rounded-xl border ${stat.borderColor}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-slate-400 text-sm mb-2">{stat.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.total !== undefined && (
                      <span className="text-slate-500 text-sm">/ {stat.total} total</span>
                    )}
                    {stat.pending !== undefined && (
                      <span className="text-amber-400 text-sm">({stat.pending} pending)</span>
                    )}
                    {stat.placed !== undefined && (
                      <span className="text-emerald-400 text-sm">({stat.placed} placed)</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Link to="/placement/post" className="glass-panel p-6 rounded-xl border border-white/10 hover:border-neon-blue/50 transition-all group">
                <PlusCircle className="w-8 h-8 mb-3 text-neon-blue" />
                <h3 className="font-bold mb-1 group-hover:text-neon-blue transition-colors">Post New Opportunity</h3>
                <p className="text-sm text-slate-400">Create internship or placement posting</p>
              </Link>
              <Link to="/placement/opportunities" className="glass-panel p-6 rounded-xl border border-white/10 hover:border-neon-purple/50 transition-all group">
                <Briefcase className="w-8 h-8 mb-3 text-neon-purple" />
                <h3 className="font-bold mb-1 group-hover:text-neon-purple transition-colors">Manage Opportunities</h3>
                <p className="text-sm text-slate-400">Edit or close posted opportunities</p>
              </Link>
              <Link to="/placement/applications" className="glass-panel p-6 rounded-xl border border-white/10 hover:border-neon-teal/50 transition-all group">
                <Users className="w-8 h-8 mb-3 text-neon-teal" />
                <h3 className="font-bold mb-1 group-hover:text-neon-teal transition-colors">Review Applications</h3>
                <p className="text-sm text-slate-400">Manage student applications</p>
              </Link>
            </div>

            {/* Recent Applications */}
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="text-amber-400" />
                  Recent Applications
                </h2>
                <Link to="/placement/applications" className="text-neon-blue text-sm hover:underline">
                  View All
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium">{app.student?.name}</h4>
                        <p className="text-sm text-slate-400">{app.student?.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default PlacementDashboard;
