import React, { useState } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import { Hexagon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const location = useLocation();

  // Determine if we show the sidebar (only on dashboard)
  const isDashboard = location.pathname.includes('/dashboard');

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-neon-purple selection:text-white">
      {/* Dynamic Background for Dashboard pages, Landing handles its own bg */}
      {isDashboard && (
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-50" />
      )}
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-40 px-8 py-6 flex justify-between items-center transition-all duration-300 ${isDashboard ? 'bg-black/50 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <Link to="/" className="flex items-center gap-2 group z-50">
           {/* Simple Text Logo to match reference image */}
           <span className="text-2xl font-bold tracking-tight text-white/90">WhyNot</span>
        </Link>

        {!isDashboard && (
            <div className="flex items-center gap-6 z-50">
                <Link to="/dashboard" className="px-6 py-2 rounded-full border border-white/20 text-xs font-semibold tracking-widest hover:bg-white hover:text-black transition-all uppercase">
                    Login
                </Link>
            </div>
        )}

        {isDashboard && (
             <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden md:block">Welcome, Alex</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[1px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">
                        AC
                    </div>
                </div>
             </div>
        )}
      </nav>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;