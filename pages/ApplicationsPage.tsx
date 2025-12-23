import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Building, MapPin, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
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
      case 'APPLIED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'APPROVED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'INTERVIEW': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'OFFER': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'REJECTED': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED': return Clock;
      case 'APPROVED': return CheckCircle;
      case 'INTERVIEW': return Calendar;
      case 'OFFER': return Building;
      case 'REJECTED': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <PageTransition>
      <div className="pt-8 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-slate-400">Track the status of your internship and placement applications.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
            <p className="text-slate-400 mb-6">You haven't applied to any opportunities yet.</p>
            <a href="/opportunities" className="px-6 py-2 bg-neon-blue text-black font-bold rounded-full hover:bg-neon-blue/90 transition-colors">
              Browse Opportunities
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app, index) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{app.opportunity.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(app.status)}`}>
                          <StatusIcon size={14} />
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-300 mb-4">
                        <Building size={16} className="text-neon-purple" />
                        <span className="font-medium">{app.opportunity.company_name}</span>
                        <span className="text-slate-600">•</span>
                        <MapPin size={16} className="text-slate-500" />
                        <span className="text-slate-400 text-sm">{app.opportunity.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          Applied on {new Date(app.created_at).toLocaleDateString()}
                        </div>
                        {app.opportunity.stipend_min && (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400">₹{app.opportunity.stipend_min.toLocaleString()} - ₹{app.opportunity.stipend_max.toLocaleString()}</span>
                          </div>
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
    </PageTransition>
  );
};

export default ApplicationsPage;