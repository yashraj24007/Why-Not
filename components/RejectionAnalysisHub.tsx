import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Cpu, AlertTriangle, CheckCircle, ArrowRight, Download, 
  TrendingUp, Target, Lightbulb, BarChart3, FileText, Sparkles 
} from 'lucide-react';
import { Application, StudentProfile } from '../types';
import { 
  generateRejectionExplanation, 
  generateBulkRejectionAnalysis, 
  formatAnalysisForExport,
  PatternAnalysis 
} from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

interface RejectionAnalysisHubProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null; // Single application
  applications?: Application[]; // Multiple applications for bulk analysis
  student: StudentProfile;
  mode: 'single' | 'bulk';
}

const RejectionAnalysisHub: React.FC<RejectionAnalysisHubProps> = ({ 
  isOpen, 
  onClose, 
  application, 
  applications = [],
  student,
  mode 
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'patterns' | 'history'>('analysis');
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  // Fetch analysis on open
  useEffect(() => {
    if (isOpen) {
      if (mode === 'single' && application && application.status === 'REJECTED') {
        fetchSingleAnalysis();
      } else if (mode === 'bulk' && applications.length > 0) {
        fetchBulkAnalysis();
      }
      fetchAnalysisHistory();
    } else {
      setExplanation('');
      setPatternAnalysis(null);
    }
  }, [isOpen, application, applications, mode]);

  const fetchSingleAnalysis = async () => {
    if (!application) return;
    
    setLoading(true);
    try {
      const reqData = {
        studentName: student.name,
        studentSkills: student.skills.map(s => s.name),
        studentCgpa: student.cgpa,
        jobRole: application.job.role,
        jobCompany: application.job.company,
        jobRequiredSkills: application.job.requiredSkills.map(s => s.name),
        jobMinCgpa: application.job.minCgpa
      };
      
      const result = await generateRejectionExplanation(reqData, student.id);
      setExplanation(result);
      
      // Save to database
      await saveAnalysis(result, application.id, 'single');
    } catch (error) {
      console.error('Analysis error:', error);
      setExplanation('Unable to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkAnalysis = async () => {
    setLoading(true);
    try {
      const rejectedApps = applications.filter(a => a.status === 'REJECTED');
      
      const bulkData = {
        studentName: student.name,
        studentSkills: student.skills.map(s => s.name),
        studentCgpa: student.cgpa,
        rejections: rejectedApps.map(app => ({
          jobRole: app.job.role,
          jobCompany: app.job.company,
          jobRequiredSkills: app.job.requiredSkills.map(s => s.name),
          jobMinCgpa: app.job.minCgpa,
          rejectionDate: app.appliedDate
        }))
      };
      
      const result = await generateBulkRejectionAnalysis(bulkData, student.id);
      setPatternAnalysis(result);
      setActiveTab('patterns');
      
      // Save bulk analysis
      await saveAnalysis(JSON.stringify(result), null, 'bulk', result);
    } catch (error) {
      console.error('Bulk analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async (
    analysisText: string, 
    applicationId: string | null, 
    type: 'single' | 'bulk',
    patternData?: any
  ) => {
    try {
      await supabase.from('rejection_analyses').insert({
        student_id: student.id,
        application_id: applicationId,
        analysis_type: type,
        analysis_text: analysisText,
        pattern_data: patternData || null
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const { data } = await supabase
        .from('rejection_analyses')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleExport = () => {
    if (!application || !explanation) return;
    
    const exportText = formatAnalysisForExport(
      student.name,
      explanation,
      { role: application.job.role, company: application.job.company }
    );
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rejection-analysis-${application.job.company}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-white max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-mono tracking-tight gradient-text">
                  {mode === 'bulk' ? 'Pattern Analysis Hub' : 'AI Rejection Analysis'}
                </h2>
                <p className="text-sm text-slate-400">
                  {mode === 'bulk' 
                    ? `Analyzing ${applications.filter(a => a.status === 'REJECTED').length} rejections` 
                    : application ? `${application.job.role} @ ${application.job.company}` : ''}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'analysis' 
                  ? 'bg-white/10 text-white border-b-2 border-neon-purple' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Analysis
              </div>
            </button>
            {mode === 'bulk' && (
              <button
                onClick={() => setActiveTab('patterns')}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'patterns' 
                    ? 'bg-white/10 text-white border-b-2 border-neon-purple' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Patterns
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'history' 
                  ? 'bg-white/10 text-white border-b-2 border-neon-purple' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                History
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'analysis' && mode === 'single' && application && (
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Requirements Match */}
                <div className="p-8 space-y-6 border-r border-white/10 bg-slate-900/50">
                  <h3 className="text-lg font-semibold text-slate-300 mb-4">Requirements Match</h3>
                  
                  <div className="space-y-3">
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

                  <div className="mt-6">
                    <div className="flex justify-between text-sm uppercase tracking-wider text-slate-500 font-mono mb-2">
                      <span>CGPA Threshold</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                      <div>
                        <span className="text-xs text-slate-400 block">Required</span>
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

                {/* Right: AI Explanation */}
                <div className="p-8 relative overflow-hidden bg-black/40">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/20 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Cpu className="w-5 h-5 text-neon-blue animate-pulse" />
                      <h3 className="text-lg font-bold gradient-text">Gemini Intelligence</h3>
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
                        className="space-y-6"
                      >
                        <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                          {explanation}
                        </p>

                        <div className="p-4 bg-neon-blue/10 border border-neon-blue/20 rounded-lg">
                          <h4 className="text-xs font-mono uppercase text-neon-blue mb-2 flex items-center gap-2">
                            <Target className="w-3 h-3" />
                            Recommended Action
                          </h4>
                          <p className="text-sm text-slate-300">
                            Focus on acquiring the missing skills to increase your match rate by up to 45%.
                          </p>
                        </div>

                        <button
                          onClick={handleExport}
                          className="w-full px-4 py-3 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-neon-purple/50 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Analysis
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && mode === 'bulk' && (
              <div className="p-8 space-y-8">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-white/10 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                  </div>
                ) : patternAnalysis && (
                  <div className="grid gap-6">
                    {/* Common Missing Skills */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Most Common Missing Skills
                      </h3>
                      <div className="space-y-3">
                        {patternAnalysis.commonMissingSkills.slice(0, 5).map((skill, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="font-medium text-slate-200">{skill.skill}</span>
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                              {skill.frequency} rejections
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Improvement Priorities */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-neon-purple" />
                        Top Improvement Priorities
                      </h3>
                      <ol className="space-y-3">
                        {patternAnalysis.improvementPriorities.map((priority, idx) => (
                          <li key={idx} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-slate-300">{priority}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Industry Insights */}
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Industry Insights
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        {patternAnalysis.industryInsights}
                      </p>
                    </div>

                    {patternAnalysis.cgpaIssues && (
                      <div className="glass-panel p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-400">
                          <AlertTriangle className="w-5 h-5" />
                          CGPA Improvement Needed
                        </h3>
                        <p className="text-slate-300">
                          Your CGPA is consistently below the minimum requirements for many opportunities. 
                          Focus on academic improvement alongside skill development.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-8">
                <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
                {analysisHistory.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No analysis history yet</p>
                ) : (
                  <div className="space-y-3">
                    {analysisHistory.map((item) => (
                      <div key={item.id} className="glass-panel p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-mono text-neon-purple">
                            {item.analysis_type.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {item.analysis_text.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RejectionAnalysisHub;
