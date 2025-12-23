import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ExplanationModal from '../components/ExplanationModal';
import { ApplicationStatus } from '../types';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { LoadingGrid, StatCardSkeleton } from '../components/LoadingSkeleton';

const ReadinessRing = ({ score }: { score: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full rotate-[-90deg]">
        <circle cx="50%" cy="50%" r={radius} stroke="#1e293b" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#bc13fe" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white">{score}%</span>
        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Ready</span>
      </div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readinessScore, setReadinessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const apps = await api.getMyApplications(user.id);
      setApplications(apps || []);
      calculateReadiness(user, apps || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadiness = (user: any, apps: any[]) => {
    let score = 0;
    // CGPA (30%)
    if (user.cgpa) score += (user.cgpa / 10) * 30;
    
    // Skills (45%) - Assume 5 skills is max score
    const skillCount = user.skills?.length || 0;
    score += Math.min(skillCount / 5, 1) * 45;
    
    // Activity (25%) - Assume 5 applications is max score
    const appCount = apps.length;
    score += Math.min(appCount / 5, 1) * 25;
    
    setReadinessScore(Math.round(score));
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="pt-8 px-6 max-w-7xl mx-auto min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <div className="lg:col-span-2">
              <LoadingGrid count={4} type="card" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleAppClick = (app: any) => {
    if (app.status === ApplicationStatus.REJECTED) {
      // Map app to format expected by ExplanationModal
      const mappedApp = {
        ...app,
        job: {
            role: app.opportunity.title,
            company: app.opportunity.company_name,
            requiredSkills: app.opportunity.required_skills || [],
            minCgpa: app.opportunity.min_cgpa
        }
      };
      setSelectedApp(mappedApp);
      setIsModalOpen(true);
    }
  };

  return (
    <PageTransition>
      <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="pt-8 px-6 max-w-7xl mx-auto min-h-screen"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Profile Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-lg font-medium text-slate-300 mb-6 w-full text-left">Career Readiness</h3>
            <ReadinessRing score={readinessScore} />
            <div className="mt-8 w-full space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Technical Skills</span>
                <span className="text-neon-blue">
                    {user?.skills?.length ? `${user.skills.length} Added` : 'None'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue" style={{ width: `${Math.min((user?.skills?.length || 0) * 20, 100)}%` }} />
              </div>
              
              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-400">CGPA</span>
                <span className="text-neon-purple">{user?.cgpa || 'N/A'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-purple" style={{ width: `${Math.min((user?.cgpa || 0) * 10, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-lg font-medium text-slate-300 mb-4">Your Skills</h3>
             <div className="flex flex-wrap gap-2">
                {user?.skills?.map((s: any) => (
                    <span key={s.name} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition-colors">
                        {s.name} ({s.level})
                    </span>
                ))}
                {!user?.skills?.length && <span className="text-slate-500 text-sm">No skills added yet.</span>}
             </div>
          </div>
        </div>

        {/* Right Col: Timeline */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 rounded-2xl min-h-[600px]">
            <h2 className="text-2xl font-bold mb-8">Application Timeline</h2>
            
            <div className="space-y-4">
              {applications.length === 0 && (
                  <div className="text-center text-slate-500 py-10">
                      No applications yet. Start applying!
                  </div>
              )}
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAppClick(app)}
                  className={`group relative p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden ${app.status === 'REJECTED' ? 'hover:border-red-500/30' : ''}`}
                >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-slate-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white">{app.opportunity.title}</h4>
                                <p className="text-slate-400 text-sm">{app.opportunity.company_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                             <div className="text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                      app.status === 'SHORTLISTED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }
                                `}>
                                    {app.status === 'REJECTED' && <AlertCircle className="w-3 h-3" />}
                                    {app.status === 'SHORTLISTED' && <CheckCircle className="w-3 h-3" />}
                                    {app.status === 'APPLIED' && <Clock className="w-3 h-3" />}
                                    {app.status}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                             </div>
                             
                             {app.status === 'REJECTED' && (
                                 <div className="hidden group-hover:flex items-center gap-2 text-xs text-neon-blue animate-pulse">
                                     View Analysis <ChevronRight className="w-4 h-4" />
                                 </div>
                             )}
                        </div>
                    </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedApp && (
        <ExplanationModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            application={selectedApp}
            student={user as any}
        />
      )}
    </motion.div>
    </PageTransition>
  );
};

export default StudentDashboard;