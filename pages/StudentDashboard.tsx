import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Briefcase, FileText, Calendar, Brain, TrendingUp, Sparkles,
  Target, Award, Zap, BarChart2, Flame, Activity, CheckCircle,
  Clock, MapPin, Star, ArrowRight, Eye, ThumbsUp, Users, BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Application, JobOpportunity } from '../types';
import RejectionAnalysisHub from '../components/RejectionAnalysisHub';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginStreak, setLoginStreak] = useState(7);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showAnalysisHub, setShowAnalysisHub] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | undefined>();
  const [analysisMode, setAnalysisMode] = useState<'single' | 'bulk'>('bulk');

  useEffect(() => {
    if (user?.id) {
      fetchData();
      calculateProfileCompletion();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [appsResult, oppsResult] = await Promise.all([
        supabase
          .from('applications')
          .select('*, opportunity:opportunities(*)')
          .eq('student_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('opportunities')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      if (appsResult.data) setApplications(appsResult.data);
      if (oppsResult.data) setOpportunities(oppsResult.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let completedFields = 0;
    const totalFields = 10;
    
    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.major) completedFields++;
    if (user.year) completedFields++;
    if (user.semester) completedFields++;
    if (user.cgpa) completedFields++;
    if (user.department) completedFields++;
    if (user.skills && user.skills.length > 0) completedFields++;
    if (user.resume_url) completedFields++;
    
    const completion = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(completion);
  };

  const stats = [
    { label: 'Applications', value: applications.length, icon: FileText, color: 'from-cyan-500 to-blue-500', change: '+3 this week' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length, icon: Users, color: 'from-purple-500 to-pink-500', change: '2 upcoming' },
    { label: 'Offers', value: applications.filter(a => a.status === 'ACCEPTED').length, icon: Award, color: 'from-green-500 to-emerald-500', change: 'Congrats!' },
    { label: 'Profile Views', value: 156, icon: Eye, color: 'from-orange-500 to-red-500', change: '+12 today' },
  ];

  const recentActivity = [
    { action: 'Application viewed by', company: 'Google', time: '2 hours ago', icon: Eye },
    { action: 'Interview scheduled with', company: 'Microsoft', time: '5 hours ago', icon: Calendar },
    { action: 'Applied to', company: 'Amazon', time: '1 day ago', icon: FileText },
    { action: 'Resume downloaded by', company: 'Meta', time: '2 days ago', icon: ThumbsUp },
  ];

  const upcomingInterviews = [
    { company: 'Microsoft', date: 'Dec 28', time: '10:00 AM', type: 'Technical' },
    { company: 'Google', date: 'Dec 30', time: '2:00 PM', type: 'HR Round' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden pt-20">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8">
        {/* Hero Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid md:grid-cols-12 gap-6 items-stretch">
            {/* Welcome Card - spans 8 columns */}
            <div className="md:col-span-8">
              <div className="relative group h-full">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <div className="relative glass-panel rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <motion.div 
                        className="flex items-center gap-3 mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 10, 0],
                            scale: [1, 1.1, 1, 1.1, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Sparkles className="w-8 h-8 text-cyan-400" />
                        </motion.div>
                        <div>
                          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                          </h1>
                          <p className="text-slate-400 text-lg mt-1">Ready to take the next step in your career?</p>
                        </div>
                      </motion.div>
                      
                      {/* Profile completion inline */}
                      <div className="mt-6 max-w-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            Profile Strength
                          </span>
                          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            {profileCompletion}%
                          </span>
                        </div>
                        <div className="relative h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${profileCompletion}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          />
                        </div>
                        {profileCompletion < 100 && (
                          <Link to="/profile" className="inline-flex items-center gap-1 mt-2 text-sm text-cyan-400 hover:text-purple-400 transition-colors">
                            <span>Complete your profile to increase visibility</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Streak Badge */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="hidden md:block"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-60" />
                        <div className="relative glass-panel rounded-2xl p-6 border border-orange-500/20">
                          <div className="text-center">
                            <Flame className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                            <p className="text-3xl font-black text-white">{loginStreak}</p>
                            <p className="text-xs text-orange-400 font-semibold">Day Streak</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Quick Action - spans 4 columns */}
            <div className="md:col-span-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
                <button
                  onClick={() => setShowAnalysisHub(true)}
                  className="relative w-full h-full glass-panel rounded-3xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                    >
                      <Brain className="w-10 h-10 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">AI Rejection Coach</h3>
                      <p className="text-sm text-slate-400">Turn rejections into opportunities</p>
                    </div>
                    {applications.filter(a => a.status === 'REJECTED').length > 0 && (
                      <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                        {applications.filter(a => a.status === 'REJECTED').length} rejections to analyze
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Row - Dynamic sizes for visual interest */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-3"
          >
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative glass-panel rounded-2xl p-6 border border-white/10 group-hover:border-cyan-500/30 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">
                    +3 this week
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-1">Applications</p>
                <p className="text-4xl font-black text-white">{applications.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-3"
          >
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative glass-panel rounded-2xl p-6 border border-white/10 group-hover:border-purple-500/30 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                    2 upcoming
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-1">Interviews</p>
                <p className="text-4xl font-black text-white">{applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 md:col-span-3"
          >
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative glass-panel rounded-2xl p-6 border border-white/10 group-hover:border-green-500/30 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  {applications.filter(a => a.status === 'ACCEPTED').length > 0 && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Congrats!
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-1">Offers</p>
                <p className="text-4xl font-black text-white">{applications.filter(a => a.status === 'ACCEPTED').length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 md:col-span-3"
          >
            <div className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative glass-panel rounded-2xl p-6 border border-white/10 group-hover:border-orange-500/30 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">
                    +12 today
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-1">Profile Views</p>
                <p className="text-4xl font-black text-white">156</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Applications - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-12 md:col-span-7"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  Recent Applications
                </h2>
                <Link to="/applications" className="flex items-center gap-1 text-cyan-400 hover:text-purple-400 transition-colors text-sm font-semibold">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No applications yet</p>
                  <Link to="/opportunities" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                    <Briefcase className="w-5 h-5" />
                    Browse Opportunities
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                  {applications.slice(0, 6).map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
                            {app.job?.role || 'Position'}
                          </h3>
                          <p className="text-slate-400 text-sm">{app.job?.company || 'Company'}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                          app.status === 'PENDING' ? 'bg-cyan-500/20 text-cyan-400' :
                          app.status === 'SHORTLISTED' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-500/20 text-purple-400' :
                          app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                          app.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Activity Feed - Medium Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-12 md:col-span-5"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30 hover:bg-slate-800/50 transition-all border border-slate-800 hover:border-purple-500/30"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        {activity.action} <span className="text-purple-400 font-semibold">{activity.company}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Interviews - Tall Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="col-span-12 md:col-span-5"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Upcoming Interviews</h2>
              </div>
              <div className="space-y-4">
                {upcomingInterviews.map((interview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20" />
                    <div className="relative p-4 border border-green-500/20 hover:border-green-500/40 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">{interview.company}</h3>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                          {interview.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{interview.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{interview.time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {upcomingInterviews.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No upcoming interviews</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* New Opportunities - Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="col-span-12 md:col-span-7"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                  New Opportunities
                </h2>
                <Link to="/opportunities" className="flex items-center gap-1 text-cyan-400 hover:text-purple-400 transition-colors text-sm font-semibold">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">No opportunities available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {opportunities.map((opp, index) => (
                    <motion.div
                      key={opp.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1 group-hover:text-cyan-400 transition-colors">
                          {opp.role}
                        </h3>
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-slate-400 text-xs mb-3 line-clamp-1">{opp.company}</p>
                      <div className="space-y-1">
                        {opp.location && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{opp.location}</span>
                          </div>
                        )}
                        {opp.stipendRange?.max && (
                          <div className="flex items-center gap-2 text-xs text-green-400 font-semibold">
                            <Zap className="w-3 h-3" />
                            <span>₹{opp.stipendRange.max}/month</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="col-span-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/resume-analyzer" className="group">
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all" />
                  <div className="relative glass-panel p-6 border border-white/10 group-hover:border-yellow-500/30 transition-all">
                    <BarChart2 className="w-10 h-10 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-semibold mb-1">Resume AI</h3>
                    <p className="text-slate-400 text-sm">Analyze & improve</p>
                  </div>
                </div>
              </Link>

              <Link to="/calendar" className="group">
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all" />
                  <div className="relative glass-panel p-6 border border-white/10 group-hover:border-green-500/30 transition-all">
                    <Calendar className="w-10 h-10 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-semibold mb-1">Calendar</h3>
                    <p className="text-slate-400 text-sm">Manage schedule</p>
                  </div>
                </div>
              </Link>

              <Link to="/profile" className="group">
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all" />
                  <div className="relative glass-panel p-6 border border-white/10 group-hover:border-indigo-500/30 transition-all">
                    <Users className="w-10 h-10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-semibold mb-1">Profile</h3>
                    <p className="text-slate-400 text-sm">Update details</p>
                  </div>
                </div>
              </Link>

              <button onClick={() => setShowAnalysisHub(true)} className="group text-left">
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-red-500/20 group-hover:from-pink-500/30 group-hover:to-red-500/30 transition-all" />
                  <div className="relative glass-panel p-6 border border-white/10 group-hover:border-pink-500/30 transition-all">
                    <TrendingUp className="w-10 h-10 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-semibold mb-1">Analytics</h3>
                    <p className="text-slate-400 text-sm">Track progress</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rejection Analysis Modal */}
      {user && showAnalysisHub && (
        <RejectionAnalysisHub
          isOpen={showAnalysisHub}
          onClose={() => setShowAnalysisHub(false)}
          application={selectedApplication}
          applications={applications}
          student={user as any}
          mode={analysisMode}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
