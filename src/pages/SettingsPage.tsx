import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Database, Loader, CheckCircle, AlertCircle,
  User, Bell, Lock, Shield, Globe, Moon, Sun, Palette, Zap,
  Code, Terminal, Server, RefreshCw, Download, Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabaseClient';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const seedOpportunities = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const sampleOpportunities = [
        {
          title: 'Frontend Developer Intern',
          company: 'Tech Startup Inc.',
          description: 'Build amazing user interfaces with React and TypeScript',
          type: 'Internship',
          location: 'Bangalore',
          stipend: 25000,
          duration: '6 months',
          skills_required: ['React', 'TypeScript', 'Tailwind CSS'],
          department: 'CSE',
          posted_by: user!.id
        },
        {
          title: 'Data Science Intern',
          company: 'Analytics Corp',
          description: 'Work with machine learning models and data analysis',
          type: 'Internship',
          location: 'Hyderabad',
          stipend: 30000,
          duration: '4 months',
          skills_required: ['Python', 'Machine Learning', 'SQL'],
          department: 'CSE',
          posted_by: user!.id
        },
        {
          title: 'Software Engineer Intern',
          company: 'Enterprise Solutions Ltd',
          description: 'Full-stack development with modern technologies',
          type: 'Internship',
          location: 'Mumbai',
          stipend: 35000,
          duration: '6 months',
          skills_required: ['Node.js', 'React', 'MongoDB'],
          department: 'CSE',
          posted_by: user!.id
        },
        {
          title: 'Backend Developer Intern',
          company: 'Cloud Systems',
          description: 'Build scalable backend systems with microservices',
          type: 'Internship',
          location: 'Pune',
          stipend: 28000,
          duration: '5 months',
          skills_required: ['Java', 'Spring Boot', 'PostgreSQL'],
          department: 'CSE',
          posted_by: user!.id
        },
        {
          title: 'Full Stack Developer',
          company: 'Innovation Labs',
          description: 'End-to-end development of web applications',
          type: 'Internship',
          location: 'Delhi',
          stipend: 32000,
          duration: '6 months',
          skills_required: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          department: 'CSE',
          posted_by: user!.id
        }
      ];

      const { error } = await supabase
        .from('opportunities')
        .insert(sampleOpportunities);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Successfully seeded ${sampleOpportunities.length} opportunities!` 
      });
      showToast('success', `${sampleOpportunities.length} opportunities added successfully`);
    } catch (error) {
      console.error('Error seeding opportunities:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to seed opportunities. Check console for details.' 
      });
      showToast('error', 'Failed to seed opportunities');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pt-28">
      {/* Pure black background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{display: 'none'}}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-purple-500/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-purple-500/30 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.2, 0.15],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-400 text-lg">Manage your account and developer tools</p>
        </motion.div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`mb-6 glass-panel rounded-2xl p-4 border ${
                message.type === 'success' 
                  ? 'border-green-500/30 bg-green-500/10' 
                  : 'border-red-500/30 bg-red-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold ${
                  message.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {message.text}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Account Settings - 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="col-span-12 md:col-span-5"
          >
            <div className="glass-panel rounded-3xl p-8 border border-white/10 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Account Settings</h2>
                  <p className="text-slate-400 text-sm">Manage your profile and security</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white">Security</h3>
                  </div>
                  <button 
                    onClick={() => showToast('info', 'Password reset link sent to your email')}
                    className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-white transition-all border border-white/10 hover:border-purple-500/30 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Change Password
                  </button>
                </div>

                {/* Notifications */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white">Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Email Notifications</span>
                      <div className="w-10 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Push Notifications</span>
                      <div className="w-10 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Developer Tools - 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="col-span-12 md:col-span-7"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <div className="relative glass-panel rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30">
                    <Terminal className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Developer Tools</h3>
                    <p className="text-sm text-slate-400">Advanced options for testing and development</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Seed Opportunities Tool */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <Database className="w-5 h-5 text-rose-400" />
                          Seed Sample Opportunities
                        </h4>
                        <p className="text-sm text-slate-400">
                          Add 5 sample internship opportunities to the database for testing.
                          This includes Frontend, Backend, Data Science, and Full Stack positions.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={seedOpportunities}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Seeding Opportunities...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span>Seed Opportunities</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Database Info */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Server className="w-5 h-5 text-purple-400" />
                      <h4 className="text-sm font-semibold text-purple-400">Database Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-xs text-slate-400 mb-1">Environment</div>
                        <div className="text-sm font-mono font-bold text-white">Production</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-xs text-slate-400 mb-1">Provider</div>
                        <div className="text-sm font-mono font-bold text-white">Supabase</div>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-300">
                      <strong className="font-semibold">Warning:</strong> These tools are for development purposes only. 
                      Use with caution in production environments.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Settings - 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="col-span-12 md:col-span-5"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  <User className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Account</h3>
                  <p className="text-sm text-slate-400">Manage your account settings</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                      <Lock className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white font-medium">Security</span>
                  </div>
                  <span className="text-slate-400 text-sm">Coming soon</span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                      <Bell className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white font-medium">Notifications</span>
                  </div>
                  <span className="text-slate-400 text-sm">Coming soon</span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors">
                      <Shield className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="text-white font-medium">Privacy</span>
                  </div>
                  <span className="text-slate-400 text-sm">Coming soon</span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-rose-500/20 group-hover:bg-cyan-500/20 transition-colors">
                      <Globe className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-white font-medium">Language</span>
                  </div>
                  <span className="text-slate-400 text-sm">English</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Appearance Settings - 6 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="col-span-12 md:col-span-6"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/30">
                  <Palette className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Appearance</h3>
                  <p className="text-sm text-slate-400">Customize your interface</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Theme Selector */}
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">Theme Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-black border-2 border-white/20 cursor-pointer"
                    >
                      <Moon className="w-6 h-6 text-white mb-2" />
                      <div className="text-sm font-semibold text-white">Dark</div>
                      <div className="text-xs text-slate-400">Current</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-not-allowed opacity-50"
                    >
                      <Sun className="w-6 h-6 text-slate-400 mb-2" />
                      <div className="text-sm font-semibold text-slate-400">Light</div>
                      <div className="text-xs text-slate-500">Coming soon</div>
                    </motion.div>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">Accent Color</label>
                  <div className="flex gap-3">
                    {['purple', 'pink', 'rose', 'indigo', 'fuchsia', 'violet'].map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-600 ${
                          color === 'purple' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions - 6 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            className="col-span-12 md:col-span-6"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
                  <p className="text-sm text-slate-400">Shortcuts and utilities</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 w-fit mb-3 group-hover:bg-green-500/20 transition-colors">
                    <RefreshCw className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-sm font-semibold text-white">Refresh Data</div>
                  <div className="text-xs text-slate-400">Sync latest changes</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-fit mb-3 group-hover:bg-indigo-500/20 transition-colors">
                    <Download className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-sm font-semibold text-white">Export Data</div>
                  <div className="text-xs text-slate-400">Download your info</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit mb-3 group-hover:bg-purple-500/20 transition-colors">
                    <Code className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-sm font-semibold text-white">API Keys</div>
                  <div className="text-xs text-slate-400">Manage integrations</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 w-fit mb-3 group-hover:bg-orange-500/20 transition-colors">
                    <SettingsIcon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-sm font-semibold text-white">Advanced</div>
                  <div className="text-xs text-slate-400">Power user options</div>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* System Info - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            className="col-span-12"
          >
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                    v1.0.0
                  </div>
                  <div className="text-xs text-slate-400">Version</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-green-400 mb-1">
                    Active
                  </div>
                  <div className="text-xs text-slate-400">Status</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-purple-400 mb-1">
                    {user.role}
                  </div>
                  <div className="text-xs text-slate-400">Account Type</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-pink-400 mb-1">
                    2024
                  </div>
                  <div className="text-xs text-slate-400">Member Since</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
