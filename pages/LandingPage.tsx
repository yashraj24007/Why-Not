import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BrainCircuit, SearchX, LineChart, Users, FileCheck, Calendar, Award, TrendingUp, Shield } from 'lucide-react';
import ThreeScene from '../components/ThreeScene';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
      <div className="relative w-full overflow-hidden bg-black text-white">
        {/* 3D Background Container */}
        <div className="fixed inset-0 z-0">
            <ThreeScene />
        </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl w-full">
            <motion.div
                initial={{ opacity: 0, y: 150, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <div className="inline-block px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full mb-6">
                  <span className="text-neon-blue text-sm font-semibold">Campus Internship & Placement Platform</span>
                </div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 100, rotateX: 45 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 60 }}
                  className="text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight mb-8"
                >
                    Turning silent <br />
                    <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        rejections
                    </span> 
                    {' '}into <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                        actionable insight.
                    </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, x: -100, y: 30 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed font-light"
                >
                    Stop wondering why you got rejected. Get AI-powered explanations that reveal skill gaps, 
                    CGPA mismatches, and improvement priorities. Turn every <span className="text-rose-400 font-medium">"Not Selected"</span> into a 
                    <span className="text-emerald-400 font-medium"> growth opportunity</span>.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.1, type: "spring", bounce: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link to="/login">
                    <button className="px-8 py-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 group shadow-lg shadow-neon-blue/50">
                        Login
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <a href="#features">
                    <button className="px-8 py-4 rounded-full border border-white/20 font-semibold text-lg hover:bg-white/10 transition-all">
                        Explore Features
                    </button>
                  </a>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section id="features" className="relative z-10 py-32 px-6 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
                <h2 className="text-5xl font-bold mb-6">Complete Campus Placement <span className="text-neon-teal">Ecosystem</span></h2>
                <p className="text-slate-400 max-w-3xl mx-auto text-lg">
                  From internship hunting to placement offers, we've digitized every step. No more scattered WhatsApp groups, 
                  email chains, or manual spreadsheets. Everything in one transparent, AI-powered platform.
                </p>
            </div>

            {/* Core Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative group p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/5 border-2 border-neon-blue/40 hover:border-neon-blue/60 transition-all duration-300 hover:shadow-2xl hover:shadow-neon-blue/30 hover:-translate-y-3"
                >
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-xs font-bold animate-pulse">
                      🎯 CORE FEATURE
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-purple/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-neon-blue/30 to-neon-purple/20 rounded-xl flex items-center justify-center mb-6 text-neon-blue backdrop-blur-sm border-2 border-neon-blue/40 shadow-lg shadow-neon-blue/20">
                          <BrainCircuit className="w-9 h-9" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-neon-blue to-white bg-clip-text text-transparent">
                        AI Rejection Coach
                      </h3>
                      <p className="text-slate-300 mb-4 leading-relaxed">
                          <span className="font-semibold text-white">"Not Selected"</span> is not an answer. Get AI-powered, personalized explanations for <span className="text-neon-blue">every rejection</span>.
                      </p>
                      <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex items-start gap-2">
                          <span className="text-neon-blue mt-0.5">✓</span>
                          <span><span className="font-medium text-white">Pattern Detection:</span> Analyze multiple rejections for common gaps</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-neon-purple mt-0.5">✓</span>
                          <span><span className="font-medium text-white">Priority Improvements:</span> Ranked action items to fix first</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-neon-teal mt-0.5">✓</span>
                          <span><span className="font-medium text-white">Export & Track:</span> Save analysis history, measure progress</span>
                        </div>
                      </div>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-purple/30 transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/20 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-700/40 to-slate-800/20 rounded-xl flex items-center justify-center mb-6 text-white backdrop-blur-sm border border-white/20">
                          <FileCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">One-Click Applications</h3>
                      <p className="text-slate-400">
                          Maintain one digital profile with resume, skills, and preferences. Apply to opportunities with a single click. 
                          Automated matching shows you the best-fit roles.
                      </p>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-teal/30 transition-all duration-300 hover:shadow-lg hover:shadow-neon-teal/20 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-teal/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-neon-teal/20 to-neon-teal/5 rounded-xl flex items-center justify-center mb-6 text-neon-teal backdrop-blur-sm border border-neon-teal/20">
                          <LineChart className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Real-Time Tracking</h3>
                      <p className="text-slate-400">
                          Monitor application status, interview schedules, and placement updates in real-time. 
                          Automated notifications keep students and officers aligned on every step.
                      </p>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-rose-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-rose-400/20 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-400/20 to-rose-400/5 rounded-xl flex items-center justify-center mb-6 text-rose-400 backdrop-blur-sm border border-rose-400/20">
                          <Calendar className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Smart Scheduling</h3>
                      <p className="text-slate-400">
                          Interview calendars sync with academic timetables. Automated notifications for all stakeholders. 
                          No more email ping-pong or missed deadlines.
                      </p>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/20 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400/20 to-amber-400/5 rounded-xl flex items-center justify-center mb-6 text-amber-400 backdrop-blur-sm border border-amber-400/20">
                        <Award className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Auto Certificates</h3>
                      <p className="text-slate-400">
                          Training supervisors log feedback directly. System automatically generates completion certificates 
                          and updates employability records for future recruiters.
                      </p>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/20 hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 rounded-xl flex items-center justify-center mb-6 text-emerald-400 backdrop-blur-sm border border-emerald-400/20">
                          <TrendingUp className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Real-Time Analytics</h3>
                      <p className="text-slate-400">
                          Placement officers see live dashboards: unplaced students, upcoming interviews, skill gap analysis. 
                          Data-driven decisions replace manual spreadsheets.
                      </p>
                    </div>
                </motion.div>
            </div>

            {/* How It Works Section */}
            <div id="how-it-works" className="mb-40">
                <h2 className="text-4xl font-bold mb-16 text-center">How It <span className="text-neon-purple">Works</span></h2>
                
                <div className="space-y-16 max-w-4xl mx-auto">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-cyan-500/20">1</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">Create Your Profile</h3>
                      <p className="text-slate-400 text-lg max-w-2xl">Students maintain one comprehensive profile with skills, resume, CGPA, and preferences. Update once per semester.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple to-rose-500 flex items-center justify-center font-bold text-2xl shadow-lg shadow-neon-purple/20">2</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">Browse Smart-Matched Opportunities</h3>
                      <p className="text-slate-400 text-lg max-w-2xl">Placement cell posts verified opportunities. AI recommends best-fit roles based on your skills, CGPA, and preferences.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 flex items-center justify-center font-bold text-2xl shadow-lg shadow-rose-500/20">3</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">One-Click Apply & Track</h3>
                      <p className="text-slate-400 text-lg max-w-2xl">Apply with one click. Track every stage in real-time: applied → interview → offer or rejection.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-400/20">4</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">Learn from Every Rejection</h3>
                      <p className="text-slate-400 text-lg max-w-2xl">
                        Get rejected? Our AI analyzes <span className="text-neon-blue font-medium">why</span> and tells you <span className="text-emerald-400 font-medium">how to improve</span>. 
                        Bulk analysis reveals patterns across multiple rejections, helping you fix the right things first.
                      </p>
                    </div>
                  </div>
                </div>
            </div>
            
            <div className="h-20"></div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;