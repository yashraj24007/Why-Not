import React from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Lock, Shield, Moon, LogOut,
  Smartphone, Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  if (!user) return null;

  const handlePasswordReset = () => {
    showToast('info', 'Password reset link sent to your email');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('success', 'Signed out successfully');
    } catch (error) {
      showToast('error', 'Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pt-28 pb-12">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account & Security */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                  <p className="text-slate-400">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-purple-300 border border-purple-500/20">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Security
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">Password</p>
                      <p className="text-sm text-slate-400">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button 
                    onClick={handlePasswordReset}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors border border-white/10"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Notifications
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-slate-400">Receive updates via email</p>
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-sm text-slate-400">Receive updates on your device</p>
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preferences & Info */}
          <div className="space-y-6">
            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-400" />
                  <span className="text-white">Dark Mode</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/20">
                  Active
                </span>
              </div>
            </motion.div>

            {/* App Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Version</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Build</span>
                  <span className="text-white">Production</span>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5">
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;