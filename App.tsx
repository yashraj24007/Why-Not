import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PlacementDashboard from './pages/PlacementDashboard';
import PostOpportunityPage from './pages/PostOpportunityPage';
import ApplicationsManagementPage from './pages/ApplicationsManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import { UserRole } from './types';
import { useAuth } from './contexts/AuthContext';

// Lazy load ThreeScene for better performance
const ThreeScene = lazy(() => import('./components/ThreeScene'));

const App: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // Determine page types
  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isAuthenticated = !!user;
  
  // Show navigation based on auth state and page type
  const showSidebar = false; // Disabled as per user request
  const showHeader = !isLanding; // Show header on all pages except landing (or maybe even on landing)

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  // Redirect to profile setup if student profile is incomplete - DISABLED
  // Allow users to access dashboard even with incomplete profile
  // const isProfileIncomplete = user && user.role === UserRole.STUDENT && !user.cgpa;
  
  // if (isProfileIncomplete && location.pathname !== '/profile-setup' && location.pathname !== '/login' && location.pathname !== '/signup') {
  //   return <Navigate to="/profile-setup" replace />;
  // }

  // Redirect authenticated users from auth pages to their dashboard
  if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
    if (user.role === UserRole.STUDENT) {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === UserRole.PLACEMENT_OFFICER) {
      return <Navigate to="/placement/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen flex bg-black text-slate-100 font-sans selection:bg-neon-purple selection:text-white">
      {/* Dynamic Background for App pages (excluding Landing) */}
      {!isLanding && (
          <div className="fixed inset-0 gradient-bg-purple -z-50" />
      )}
      
      {/* Lazy-loaded ThreeScene for better performance */}
      {isLanding && (
        <Suspense fallback={null}>
          <ThreeScene />
        </Suspense>
      )}
      
      {/* Sidebar for authenticated users - DISABLED */}
      {/* {showSidebar && (
        <Sidebar 
          userRole={user?.role}
          userName={user?.name}
          userAvatar={user?.avatar}
        />
      )} */}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Header for all users (excluding landing if desired, but logic above handles it) */}
        {showHeader && (
          <Header 
            userRole={user?.role}
            userName={user?.name}
            userAvatar={user?.avatar}
            notifications={user?.notifications}
          />
        )}

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile-setup" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                <ProfileSetupPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/opportunities" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                <OpportunitiesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.STUDENT}>
                <ApplicationsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute userRole={user?.role}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Placement Officer Routes */}
          <Route 
            path="/placement/dashboard" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.PLACEMENT_OFFICER}>
                <PlacementDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/placement/post" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.PLACEMENT_OFFICER}>
                <PostOpportunityPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/placement/applications" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.PLACEMENT_OFFICER}>
                <ApplicationsManagementPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile Route - accessible to all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute userRole={user?.role}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Settings Route - accessible to all authenticated users */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute userRole={user?.role}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
      
      {/* Footer - Show on all pages except landing */}
      {!isLanding && <Footer />}
      </div>
    </div>
  );
};

export default App;