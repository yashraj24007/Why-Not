import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Briefcase, Users, FileText, Settings, LogOut, 
  Calendar, BarChart3, UserCheck, BookOpen, ChevronLeft, 
  ChevronRight, Bell
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
  userAvatar?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userRole, 
  userName = 'Guest',
  userAvatar
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: Home },
          { label: 'Opportunities', path: '/opportunities', icon: Briefcase },
          { label: 'My Applications', path: '/applications', icon: FileText },
          { label: 'Calendar', path: '/calendar', icon: Calendar },
          { label: 'Profile', path: '/profile', icon: Users },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
      
      case UserRole.PLACEMENT_OFFICER:
        return [
          { label: 'Dashboard', path: '/placement/dashboard', icon: Home },
          { label: 'Post Opportunity', path: '/placement/post', icon: Briefcase },
          { label: 'Applications', path: '/placement/applications', icon: FileText },
          { label: 'Calendar', path: '/calendar', icon: Calendar },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const showExpanded = isExpanded || isHovered;

  return (
    <>
      {/* Hover trigger area - invisible zone on left edge */}
      <div
        className="fixed left-0 top-0 w-12 h-screen z-50"
        onMouseEnter={() => setIsHovered(true)}
      />
      
      <motion.aside
        initial={{ x: -280 }}
        animate={{ 
          x: isHovered || isExpanded ? 0 : -280, 
          width: showExpanded ? 280 : 80
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed left-0 top-0 h-screen bg-slate-950/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-hidden shadow-2xl"
      >
      {/* Motion Blur Overlay on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-neon-purple/5 to-transparent pointer-events-none"
            style={{ filter: 'blur(50px)' }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full relative z-10">
        {/* Logo & Toggle */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple p-[2px]">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                <span className="text-lg font-bold gradient-text">W</span>
              </div>
            </div>
            <AnimatePresence>
              {showExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xl font-bold tracking-tight text-white/90 whitespace-nowrap overflow-hidden"
                >
                  WhyNot
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {!isHovered && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white font-bold">
                {initials}
              </div>
            )}
            <AnimatePresence>
              {showExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="font-semibold text-white whitespace-nowrap">{userName}</p>
                  <p className="text-xs text-slate-400 whitespace-nowrap">
                    {userRole?.replace('_', ' ')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-neon-blue' : ''}`} />
                <AnimatePresence>
                  {showExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Notifications & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
            <Bell className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {showExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  <NotificationBell />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {showExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
    </>
  );
};

export default Sidebar;
