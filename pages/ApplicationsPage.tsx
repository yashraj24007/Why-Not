import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Building, MapPin, CheckCircle, XCircle, Clock, AlertCircle, Brain, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const data = await api.getMyApplications(user!.id);
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'SHORTLISTED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'INTERVIEW_SCHEDULED': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'ACCEPTED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'REJECTED': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'SHORTLISTED': return CheckCircle;
      case 'INTERVIEW_SCHEDULED': return Calendar;
      case 'ACCEPTED': return Building;
      case 'REJECTED': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <PageTransition>
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
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">My Applications</h1>
            <p className="text-slate-400 text-lg">Track the status of your internship and placement applications</p>
          </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : applications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 glass-panel rounded-2xl border border-white/10 backdrop-blur-xl bg-slate-900/80"
          >
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">No Applications Yet</h3>
            <p className="text-slate-400 mb-6">You haven't applied to any opportunities yet</p>
            <a href="/opportunities" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Browse Opportunities
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app, index) => {
              const StatusIcon = getStatusIcon(app.status);
              const isRejected = app.status === 'REJECTED';
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  <div className="relative glass-panel rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all backdrop-blur-xl bg-slate-900/80">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">{app.opportunity.title}</h3>
                          <span className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 ${getStatusColor(app.status)}`}>
                            <StatusIcon size={14} />
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-300 mb-4">
                          <Building size={16} className="text-purple-400" />
                          <span className="font-medium">{app.opportunity.company_name}</span>
                          <span className="text-slate-600">•</span>
                          <MapPin size={16} className="text-slate-500" />
                          <span className="text-slate-400 text-sm">{app.opportunity.location}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </div>
                          {app.opportunity.stipend_min && (
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-semibold">₹{app.opportunity.stipend_min.toLocaleString()} - ₹{app.opportunity.stipend_max.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* AI Rejection Analysis Prompt */}
                        {isRejected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                                <Brain className="w-5 h-5 text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-white mb-1">Want to know why?</h4>
                                <p className="text-xs text-slate-400 mb-3">Use our AI Rejection Coach to analyze this rejection and get actionable insights</p>
                                <a 
                                  href="/dashboard"
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                  <Brain className="w-4 h-4" />
                                  Analyze Rejection
                                  <ArrowRight className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Status Timeline */}
                        {app.status === 'INTERVIEW_SCHEDULED' && app.interview_date && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-amber-400" />
                              <div>
                                <h4 className="text-sm font-bold text-white">Interview Scheduled</h4>
                                <p className="text-xs text-slate-400">
                                  {new Date(app.interview_date).toLocaleDateString()} at {app.interview_time || 'TBD'}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {app.status === 'ACCEPTED' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                              <div>
                                <h4 className="text-sm font-bold text-white">Congratulations! 🎉</h4>
                                <p className="text-xs text-slate-400">Your application has been accepted</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ApplicationsPage;