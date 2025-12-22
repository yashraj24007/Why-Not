import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ExplanationModal from '../components/ExplanationModal';
import { StudentProfile, Application, ApplicationStatus, JobOpportunity } from '../types';

// Mock Data
const MOCK_STUDENT: StudentProfile = {
  id: 's1',
  name: 'Alex Chen',
  major: 'Computer Science',
  cgpa: 8.2,
  skills: [
    { name: 'Java', level: 'Advanced' },
    { name: 'React', level: 'Intermediate' },
    { name: 'Python', level: 'Intermediate' }
  ]
};

const MOCK_JOBS: JobOpportunity[] = [
  {
    id: 'j1',
    role: 'Data Analyst',
    company: 'FinTech Corp',
    requiredSkills: [
        { name: 'SQL', level: 'Advanced' },
        { name: 'Python', level: 'Intermediate' },
        { name: 'Tableau', level: 'Intermediate' }
    ],
    minCgpa: 8.0
  },
  {
    id: 'j2',
    role: 'Frontend Developer',
    company: 'Creative Tech',
    requiredSkills: [
        { name: 'React', level: 'Advanced' },
        { name: 'TypeScript', level: 'Intermediate' }
    ],
    minCgpa: 7.5
  }
];

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    jobId: 'j1',
    studentId: 's1',
    job: MOCK_JOBS[0],
    status: ApplicationStatus.REJECTED,
    appliedDate: '2023-10-15',
  },
  {
    id: 'a2',
    jobId: 'j2',
    studentId: 's1',
    job: MOCK_JOBS[1],
    status: ApplicationStatus.SHORTLISTED,
    appliedDate: '2023-10-18',
  },
  {
    id: 'a3',
    jobId: 'j2',
    studentId: 's1',
    job: { ...MOCK_JOBS[1], role: "Backend Intern", company: "StartUp Inc" },
    status: ApplicationStatus.APPLIED,
    appliedDate: '2023-10-20',
  }
];

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
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAppClick = (app: Application) => {
    if (app.status === ApplicationStatus.REJECTED) {
      setSelectedApp(app);
      setIsModalOpen(true);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="pt-24 px-6 max-w-7xl mx-auto min-h-screen"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Profile Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-lg font-medium text-slate-300 mb-6 w-full text-left">Career Readiness</h3>
            <ReadinessRing score={72} />
            <div className="mt-8 w-full space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Technical Skills</span>
                <span className="text-neon-blue">Advanced</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue w-[85%]" />
              </div>
              
              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-400">Soft Skills</span>
                <span className="text-neon-purple">Developing</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-purple w-[60%]" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-lg font-medium text-slate-300 mb-4">Your Skills</h3>
             <div className="flex flex-wrap gap-2">
                {MOCK_STUDENT.skills.map(s => (
                    <span key={s.name} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition-colors">
                        {s.name}
                    </span>
                ))}
             </div>
          </div>
        </div>

        {/* Right Col: Timeline */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 rounded-2xl min-h-[600px]">
            <h2 className="text-2xl font-bold mb-8">Application Timeline</h2>
            
            <div className="space-y-4">
              {MOCK_APPLICATIONS.map((app, index) => (
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
                                <h4 className="font-bold text-lg text-white">{app.job.role}</h4>
                                <p className="text-slate-400 text-sm">{app.job.company}</p>
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
                                <p className="text-xs text-slate-500 mt-1">{app.appliedDate}</p>
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

      <ExplanationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        application={selectedApp}
        student={MOCK_STUDENT}
      />
    </motion.div>
  );
};

export default StudentDashboard;