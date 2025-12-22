import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BrainCircuit, SearchX, LineChart } from 'lucide-react';
import ThreeScene from '../components/ThreeScene';
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
      <section className="relative z-10 h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Logo text placement similar to image top-left (handled by nav usually, but emphasizing brand here) */}
                
                <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight mb-8">
                    Turning silent <br />
                    <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        rejections
                    </span> 
                    {' '}into <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                        actionable insight.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-light">
                    Stop guessing why you weren't shortlisted. Get instant, AI-generated explanations for every placement decision. This isn't just a portal; it's your career intelligence engine.
                </p>
                
                <Link to="/dashboard">
                    <button className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 group">
                        Access Dashboard
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </motion.div>
        </div>
      </section>

      {/* Features Section with Parallax */}
      <section className="relative z-10 py-32 px-6 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
            <div className="mb-20">
                <h2 className="text-4xl font-bold mb-4">The Black Box, <span className="text-neon-teal">Solved.</span></h2>
                <p className="text-slate-400 max-w-2xl">Traditional portals are static. WhyNot is a feedback loop designed to improve your employability in real-time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div style={{ y: 0 }} className="glass-panel p-8 rounded-2xl border-t border-neon-blue/20">
                    <div className="w-14 h-14 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-6 text-neon-blue">
                        <SearchX className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">No More Silence</h3>
                    <p className="text-slate-400">
                        "Not Selected" is not an answer. We force transparency by analyzing the exact gap between your profile and the job description.
                    </p>
                </motion.div>

                <motion.div style={{ y: y1 }} className="glass-panel p-8 rounded-2xl border-t border-neon-purple/20 relative top-12">
                    <div className="w-14 h-14 bg-neon-purple/10 rounded-xl flex items-center justify-center mb-6 text-neon-purple">
                        <BrainCircuit className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Gemini Powered</h3>
                    <p className="text-slate-400">
                        Our Explanation Engine uses Google Gemini 1.5 Pro to generate personalized, factual, and constructive feedback for every rejection.
                    </p>
                </motion.div>

                <motion.div style={{ y: y2 }} className="glass-panel p-8 rounded-2xl border-t border-neon-teal/20 relative top-24">
                    <div className="w-14 h-14 bg-neon-teal/10 rounded-xl flex items-center justify-center mb-6 text-neon-teal">
                        <LineChart className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Readiness Index</h3>
                    <p className="text-slate-400">
                        Track your career readiness in real-time. See how your skills stack up against live market demands.
                    </p>
                </motion.div>
            </div>
            
            <div className="h-40"></div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;