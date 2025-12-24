import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Eye, EyeOff, User, Building, GraduationCap, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';
import PageTransition from '../components/PageTransition';
import ParticleBackground from '../components/ParticleBackground';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STUDENT,
    department: '',
    organization: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    // Check for educational email (optional but recommended)
    if (formData.role === UserRole.STUDENT && !email.includes('.edu') && !email.includes('college')) {
      setEmailError('Please use your college/university email');
    } else {
      setEmailError('');
    }
    return true;
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    // Set strength label
    if (score <= 2) {
      setPasswordStrength({ score, label: 'Weak', color: 'bg-red-500' });
    } else if (score <= 4) {
      setPasswordStrength({ score, label: 'Medium', color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score, label: 'Strong', color: 'bg-green-500' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'email') {
      validateEmail(value);
    }
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const additionalData: any = { department: formData.department };

      await signUp(formData.email, formData.password, formData.name, formData.role, additionalData);
      // Don't navigate here - let App.tsx handle routing based on user role
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create account. Please try again.';
      
      // Check if user already exists
      if (errorMessage.toLowerCase().includes('user already registered') || 
          errorMessage.toLowerCase().includes('already registered') ||
          errorMessage.toLowerCase().includes('already exists')) {
            
        // Attempt to recover account by signing in and creating profile
        try {
           console.log("Attempting to recover account...");
           const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
             email: formData.email,
             password: formData.password
           });
           
           if (!signInError && signInData.user) {
             // Check if profile exists
             const { data: profile } = await supabase.from('profiles').select('id').eq('id', signInData.user.id).maybeSingle();
             
             if (!profile) {
               console.log("Profile missing, creating new profile...");
               // Create missing profile
                const additionalData: any = { department: formData.department };

               const { error: insertError } = await supabase.from('profiles').insert({
                  id: signInData.user.id,
                  email: formData.email,
                  name: formData.name,
                  role: formData.role,
                  ...additionalData,
               });
               
               if (insertError) {
                 console.error("Failed to create profile:", insertError);
                 throw insertError;
               }
               
               console.log("Profile created successfully. Refreshing user...");
               await refreshUser();
               // Navigate based on role
               if (formData.role === UserRole.STUDENT) {
                 navigate('/dashboard');
               } else if (formData.role === UserRole.PLACEMENT_OFFICER) {
                 navigate('/placement-dashboard');
               } else {
                 navigate('/dashboard');
               }
               return;
             }
           }
        } catch (recoveryError) {
           console.error("Account recovery failed", recoveryError);
        }

        // Redirect to login page after a short delay
        setError('This email is already registered. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: UserRole.STUDENT, label: 'Student', icon: GraduationCap, description: 'Looking for internships and placements' },
    { value: UserRole.PLACEMENT_OFFICER, label: 'Placement Officer', icon: Building, description: 'Manage campus placements' },
  ];

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-12 gradient-bg-purple overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-purple/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8 glass-panel rounded-2xl p-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple p-[2px] shadow-lg shadow-neon-purple/50">
              <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                <span className="text-xl font-bold gradient-text">W</span>
              </div>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              WhyNot
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 shadow-lg shadow-neon-purple/20">
              <UserPlus className="w-6 h-6 text-neon-purple" />
            </div>
            Create Account
          </h1>
          <p className="text-slate-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">Join the campus placement platform</p>
        </div>

        {/* Signup Form */}
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.role === option.value
                          ? 'glass-panel-dark border-neon-purple shadow-lg shadow-neon-purple/20'
                          : 'glass-panel border-purple-glow-20 hover:border-purple-glow-30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 mt-0.5 ${formData.role === option.value ? 'text-neon-purple' : 'text-slate-400'}`} />
                      <div className="ml-3 flex-1">
                        <span className={`block text-sm font-medium ${formData.role === option.value ? 'text-white' : 'text-slate-300'}`}>
                          {option.label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">
                          {option.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 glass-panel rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 glass-panel rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition-all ${
                      emailError ? 'border-red-500/50' : 'focus:border-neon-purple/50'
                    }`}
                    placeholder="john@college.edu"
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-300 mb-2">
                Branch/Department
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 glass-panel rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
              >
                <option value="" className="bg-slate-900">Select your branch</option>
                <option value="Computer Science & Engineering" className="bg-slate-900">Computer Science & Engineering</option>
                <option value="Information Technology" className="bg-slate-900">Information Technology</option>
                <option value="Electronics & Communication" className="bg-slate-900">Electronics & Communication</option>
                <option value="Electrical Engineering" className="bg-slate-900">Electrical Engineering</option>
                <option value="Mechanical Engineering" className="bg-slate-900">Mechanical Engineering</option>
                <option value="Civil Engineering" className="bg-slate-900">Civil Engineering</option>
                <option value="Chemical Engineering" className="bg-slate-900">Chemical Engineering</option>
                <option value="Biotechnology" className="bg-slate-900">Biotechnology</option>
                <option value="Aerospace Engineering" className="bg-slate-900">Aerospace Engineering</option>
                <option value="Other" className="bg-slate-900">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Password Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.label === 'Weak' ? 'text-red-400' :
                        passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>{passwordStrength.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Use 8+ chars, mix of upper/lowercase, numbers & symbols</p>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 glass-panel rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-bold text-white text-lg
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-purple/50 
                active:scale-[0.98]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-neon-purple before:to-neon-blue before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10
                overflow-hidden
                shadow-lg shadow-neon-blue/30"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6">
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-center hover:border-neon-purple/30 transition-colors">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-neon-purple hover:text-neon-blue transition-colors font-semibold inline-flex items-center gap-1"
                >
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </PageTransition>
  );
};

export default SignupPage;
