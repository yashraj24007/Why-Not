import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import ParticleBackground from '../components/ParticleBackground';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Don't navigate here - let App.tsx handle routing based on user role
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 gradient-bg-purple overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-purple/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8 glass-panel rounded-2xl p-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple p-[2px] shadow-lg shadow-neon-blue/50">
              <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                <span className="text-xl font-bold gradient-text">W</span>
              </div>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              WhyNot
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Welcome Back</h1>
          <p className="text-slate-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="glass-panel rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 glass-panel rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
                  placeholder="student@college.edu"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 glass-panel rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-black/50 text-neon-blue focus:ring-neon-blue/50"
                />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-bold text-white text-lg
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-blue/50 
                active:scale-[0.98]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-neon-purple before:to-neon-blue before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10
                overflow-hidden
                shadow-lg shadow-neon-purple/30"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6">
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-center hover:border-neon-blue/30 transition-colors">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-neon-blue hover:text-neon-purple transition-colors font-semibold inline-flex items-center gap-1"
                >
                  Sign up
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 border border-neon-blue/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></div>
                <p className="text-sm font-semibold text-slate-300">Demo Credentials</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-lg hover:border-neon-blue/30 transition-colors">
                  <span className="text-slate-400 font-medium">Student:</span>
                  <span className="text-slate-200 font-mono">student@demo.com / demo123</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-lg hover:border-neon-purple/30 transition-colors">
                  <span className="text-slate-400 font-medium">Placement:</span>
                  <span className="text-slate-200 font-mono">placement@demo.com / demo123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </PageTransition>
  );
};

export default LoginPage;
