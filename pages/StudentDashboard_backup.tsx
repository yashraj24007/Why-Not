import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, TrendingUp, FileText, Award, ArrowRight, Calendar, MapPin, DollarSign,
  Target, Clock, Zap, BookOpen, Users, CheckCircle, Flame, TrendingDown, Brain,
  Bell, Star, Activity, Sparkles, BarChart2, TrendingDown as TrendDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import RejectionAnalysisHub from '../components/RejectionAnalysisHub';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalysisHub, setShowAnalysisHub] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'single' | 'bulk'>('single');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [activeView, setActiveView] = useState<'overview' | 'analytics'>('overview');

  // Mock data for innovative features
  const loginStreak = 7; // Days
  const profileCompletion = user?.cgpa && user?.skills?.length > 0 ? 85 : 45;
  
  // Dynamic color based on completion percentage
  const getCompletionColor = () => {
    if (profileCompletion < 30) return {
      gradient: 'from-red-500 via-red-400 to-orange-500',
      glow: 'shadow-red-500/50',
      text: 'text-red-400',
      border: 'border-red-500/20'
    };
    if (profileCompletion < 60) return {
      gradient: 'from-orange-500 via-yellow-400 to-orange-500',
      glow: 'shadow-orange-500/50',
      text: 'text-orange-400',
      border: 'border-orange-500/20'
    };
    if (profileCompletion < 80) return {
      gradient: 'from-yellow-500 via-cyan-400 to-yellow-500',
      glow: 'shadow-yellow-500/50',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20'
    };
    return {
      gradient: 'from-green-500 via-emerald-400 to-green-500',
      glow: 'shadow-green-500/50',
      text: 'text-green-400',
      border: 'border-green-500/20'
    };
  };
  
  const completionColors = getCompletionColor();
  const upcomingInterviews = [
    { company: 'TechCorp', date: 'Dec 26, 2025', time: '10:00 AM', type: 'Technical Round' },
    { company: 'StartupXYZ', date: 'Dec 27, 2025', time: '2:00 PM', type: 'HR Round' },
  ];
  const recommendations = [
    { title: 'Complete your skills section', priority: 'high', action: '/profile' },
    { title: 'Add your resume', priority: 'medium', action: '/profile-setup' },
    { title: 'Practice coding challenges', priority: 'low', action: '/resources' },
  ];
  const recentActivity = [
    { action: 'Applied to Frontend Developer', company: 'Google', time: '2 hours ago', icon: FileText },
    { action: 'Profile viewed by', company: 'Microsoft', time: '5 hours ago', icon: Users },
    { action: 'Interview scheduled with', company: 'Amazon', time: '1 day ago', icon: Calendar },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [appsData, oppsData] = await Promise.all([
          api.getMyApplications(user.id).catch(() => []),
          api.getOpportunities().catch(() => [])
        ]);
        
        setApplications(appsData || []);
        setOpportunities((oppsData || []).slice(0, 3)); // Show top 3
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    { label: 'Active Applications', value: applications.filter(a => ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length, icon: FileText, color: 'from-teal-500 to-cyan-500' },
    { label: 'Opportunities', value: opportunities.length, icon: Briefcase, color: 'from-purple-500 to-pink-500' },
    { label: 'Profile Score', value: user?.cgpa ? `${user.cgpa}/10` : 'N/A', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Achievements', value: user?.skills?.length || 0, icon: Award, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen pt-28 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-400 text-lg">Here's what's happening with your career journey</p>
            </div>
            
            {/* Streak Counter */}
            <motion.div 
              className="mt-4 md:mt-0 glass-panel rounded-2xl p-4 flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loginStreak} Days</p>
                <p className="text-xs text-slate-400">Login Streak 🔥</p>
              </div>
            </motion.div>
          </div>

          {/* Profile Completion Bar */}
          <motion.div 
            className={`glass-panel rounded-xl p-5 border ${completionColors.border}`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className={`w-5 h-5 ${completionColors.text}`} />
                <span className="text-sm text-white font-semibold">Profile Completion</span>
              </div>
              <span className={`text-lg font-bold ${completionColors.text}`}>{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/50 shadow-inner">
              <motion.div 
                className={`h-full bg-gradient-to-r ${completionColors.gradient} rounded-full shadow-lg ${completionColors.glow}`}
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                style={{
                  boxShadow: `0 0 15px ${profileCompletion < 30 ? 'rgba(239, 68, 68, 0.6)' : profileCompletion < 60 ? 'rgba(249, 115, 22, 0.6)' : profileCompletion < 80 ? 'rgba(234, 179, 8, 0.6)' : 'rgba(34, 197, 94, 0.6)'}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                }}
              />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <span className={`inline-block w-1 h-1 rounded-full ${completionColors.text} animate-pulse`}></span>
                {profileCompletion < 30 ? 'Start completing your profile to unlock opportunities!' :
                 profileCompletion < 60 ? 'Good progress! Keep adding details to your profile.' :
                 profileCompletion < 80 ? 'Almost there! Complete your profile for maximum visibility.' :
                 'Excellent! Just a few more details to go.'}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Rejection Analysis Hero Section - PROMINENT */}
        {applications.filter(a => a.status === 'REJECTED').length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative overflow-hidden rounded-3xl"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-black to-neon-blue/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/30 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/30 blur-[120px] rounded-full" />
            
            <div className="relative glass-panel border-2 border-neon-purple/30 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center animate-pulse">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold gradient-text">AI Rejection Coach</h2>
                      <p className="text-sm text-neon-blue font-mono">Powered by Gemini 2.0</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                    Turn your <span className="text-red-400 font-semibold">{applications.filter(a => a.status === 'REJECTED').length} rejection{applications.filter(a => a.status === 'REJECTED').length > 1 ? 's' : ''}</span> into 
                    actionable insights. Get AI-powered analysis, identify patterns, and discover exactly what to improve.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setAnalysisMode('bulk');
                        setShowAnalysisHub(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-neon-purple/50 transition-all flex items-center gap-2 group"
                    >
                      <BarChart2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Analyze All Rejections
                    </button>
                    <Link
                      to="/applications"
                      className="px-6 py-3 glass-panel rounded-xl text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      View Applications
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-neon-purple/20 hover:border-neon-purple/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Pattern Detection</span>
                    </div>
                    <p className="text-sm text-slate-400">Identify common missing skills across rejections</p>
                  </div>
                  
                  <div className="glass-panel p-4 rounded-xl border border-neon-blue/20 hover:border-neon-blue/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-neon-blue" />
                      <span className="text-white font-semibold">Priority Improvements</span>
                    </div>
                    <p className="text-sm text-slate-400">Get ranked list of skills to focus on</p>
                  </div>
                  
                  <div className="glass-panel p-4 rounded-xl border border-purple-400/20 hover:border-purple-400/50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendDown className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold">Progress Tracking</span>
                    </div>
                    <p className="text-sm text-slate-400">See your improvement over time</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
                <Link to="/applications" className="text-neon-blue hover:text-neon-purple transition-colors flex items-center gap-1">
                  View All <ArrowRight size={16} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-800/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No applications yet</p>
                  <Link to="/opportunities" className="text-neon-blue hover:text-neon-purple mt-2 inline-block">
                    Browse Opportunities
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{app.opportunity?.title || 'Position'}</h3>
                          <p className="text-slate-400 text-sm">{app.opportunity?.company_name || 'Company'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'APPLIED' ? 'bg-cyan-500/20 text-cyan-400' :
                          app.status === 'SHORTLISTED' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-500/20 text-purple-400' :
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
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-neon-purple" />
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 pb-4 border-b border-slate-800 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-4 h-4 text-neon-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {activity.action} <span className="text-neon-purple font-semibold">{activity.company}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-neon-blue" />
                <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-cyan-500/10 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-cyan-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white mb-2">{rec.title}</p>
                        <Link 
                          to={rec.action}
                          className="text-xs text-neon-blue hover:text-neon-purple transition-colors flex items-center gap-1"
                        >
                          Take Action <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Interviews */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Upcoming Interviews</h2>
              </div>
              <div className="space-y-4">
                {upcomingInterviews.map((interview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">{interview.company}</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        {interview.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{interview.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{interview.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* New Opportunities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">New Opportunities</h2>
                <Link to="/opportunities" className="text-neon-blue hover:text-neon-purple transition-colors">
                  <ArrowRight size={20} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-800/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No opportunities available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp, index) => (
                    <motion.div
                      key={opp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent hover:border-neon-purple/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm flex-1">{opp.title}</h3>
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <p className="text-slate-400 text-xs mb-3">{opp.company_name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {opp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{opp.location}</span>
                          </div>
                        )}
                        {opp.stipend_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} />
                            <span>₹{opp.stipend_max}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Link to="/opportunities" className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform group">
            <Briefcase className="w-10 h-10 text-neon-blue mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Browse Opportunities</h3>
            <p className="text-slate-400 text-sm">Find your next internship or placement</p>
          </Link>

          <Link to="/applications" className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform group">
            <FileText className="w-10 h-10 text-neon-purple mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Track Applications</h3>
            <p className="text-slate-400 text-sm">Monitor your application status</p>
          </Link>

          <Link to="/profile" className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform group">
            <Award className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">Update Profile</h3>
            <p className="text-slate-400 text-sm">Keep your information current</p>
          </Link>

          <Link to="/analytics" className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform group">
            <TrendingUp className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold mb-2">View Analytics</h3>
            <p className="text-slate-400 text-sm">Track your progress and insights</p>
          </Link>
        </motion.div>

        {/* Skill Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-neon-purple" />
            <h2 className="text-2xl font-bold text-white">Skill Development Progress</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(user?.skills || []).slice(0, 6).map((skill: any, index: number) => {
              const progress = skill.level === 'Advanced' ? 90 : skill.level === 'Intermediate' ? 60 : 30;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-neon-purple/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">{skill.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'Advanced' ? 'bg-green-500/20 text-green-400' :
                      skill.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${
                        skill.level === 'Advanced' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        skill.level === 'Intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-teal-500 to-cyan-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{progress}% mastered</p>
                </motion.div>
              );
            })}
            {(!user?.skills || user.skills.length === 0) && (
              <div className="col-span-full text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Add skills to your profile to track progress</p>
                <Link to="/profile" className="text-neon-blue hover:text-neon-purple mt-2 inline-block">
                  Add Skills
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Rejection Analysis Modal */}
      {user && showAnalysisHub && (
        <RejectionAnalysisHub
          isOpen={showAnalysisHub}
          onClose={() => setShowAnalysisHub(false)}
          application={selectedApplication}
          applications={applications}
          student={user}
          mode={analysisMode}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
