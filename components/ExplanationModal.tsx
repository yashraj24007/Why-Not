import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Application, StudentProfile } from '../types';
import { generateRejectionExplanation } from '../services/geminiService';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  student: StudentProfile;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, application, student }) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && application && application.status === 'REJECTED') {
      const fetchExplanation = async () => {
        setLoading(true);
        const reqData = {
          studentName: student.name,
          studentSkills: student.skills.map(s => s.name),
          studentCgpa: student.cgpa,
          jobRole: application.job.role,
          jobCompany: application.job.company,
          jobRequiredSkills: application.job.requiredSkills.map(s => s.name),
          jobMinCgpa: application.job.minCgpa
        };
        
        const result = await generateRejectionExplanation(reqData);
        setExplanation(result);
        setLoading(false);
      };

      fetchExplanation();
    } else {
        setExplanation('');
    }
  }, [isOpen, application, student]);

  if (!isOpen || !application) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-mono tracking-tight">Application Analysis</h2>
                <p className="text-sm text-slate-400">{application.job.role} @ {application.job.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Col: Data Comparison */}
            <div className="p-8 space-y-8 border-r border-white/10 bg-slate-900/50">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Requirements Match</h3>
              
              {/* Skills Comparison */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono">
                  <span>Required Skills</span>
                  <span>Your Status</span>
                </div>
                {application.job.requiredSkills.map((reqSkill) => {
                    const hasSkill = student.skills.find(s => s.name === reqSkill.name);
                    return (
                        <div key={reqSkill.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                            <span className="font-medium text-slate-200">{reqSkill.name}</span>
                            {hasSkill ? (
                                <span className="flex items-center gap-2 text-green-400 text-sm">
                                    <CheckCircle className="w-4 h-4" /> Match
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-red-400 text-sm">
                                    <X className="w-4 h-4" /> Missing
                                </span>
                            )}
                        </div>
                    );
                })}
              </div>

              {/* CGPA Comparison */}
              <div className="mt-6">
                <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono mb-2">
                    <span>CGPA Threshold</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                    <div>
                        <span className="text-xs text-slate-400 block">Minimum Required</span>
                        <span className="text-lg font-bold text-white">{application.job.minCgpa}</span>
                    </div>
                    <ArrowRight className="text-slate-500" />
                    <div className="text-right">
                        <span className="text-xs text-slate-400 block">Your Score</span>
                        <span className={`text-lg font-bold ${student.cgpa >= application.job.minCgpa ? 'text-green-400' : 'text-red-400'}`}>
                            {student.cgpa}
                        </span>
                    </div>
                </div>
              </div>
            </div>

            {/* Right Col: AI Explanation */}
            <div className="p-8 relative overflow-hidden bg-black/40 flex flex-col justify-center">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                   <Cpu className="w-5 h-5 text-neon-blue animate-pulse" />
                   <h3 className="text-lg font-bold gradient-text">Gemini Intelligence Engine</h3>
                </div>

                {loading ? (
                  <div className="space-y-4">
                     <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                     <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                     <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-invert prose-p:text-slate-300 prose-p:leading-relaxed"
                  >
                     <p className="whitespace-pre-wrap font-sans text-lg">
                        {explanation}
                     </p>
                  </motion.div>
                )}

                {!loading && (
                    <div className="mt-8 p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
                        <h4 className="text-xs font-mono uppercase text-neon-blue mb-1">Recommended Action</h4>
                        <p className="text-sm text-slate-300">
                             Based on the analysis, focusing on your missing skills will increase your match rate by 45%.
                        </p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExplanationModal;