import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PlacementDashboard from './pages/PlacementDashboard';
import PostOpportunityPage from './pages/PostOpportunityPage';
import ManageOpportunitiesPage from './pages/ManageOpportunitiesPage';
import ApplicationsManagementPage from './pages/ApplicationsManagementPage';
import StudentAnalyticsPage from './pages/StudentAnalyticsPage';
import MentorDashboard from './pages/MentorDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateSearchPage from './pages/CandidateSearchPage';
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
  const showSidebar = isAuthenticated && !isLanding && !isAuthPage;
  const showHeader = !isAuthenticated && !isLanding;
  const showFooter = !isLanding;

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  // Redirect to profile setup if student profile is incomplete
  const isProfileIncomplete = user && user.role === UserRole.STUDENT && (!user.cgpa || !user.skills || user.skills.length === 0);
  if (isProfileIncomplete && location.pathname !== '/profile-setup' && location.pathname !== '/login') {
    return <Navigate to="/profile-setup" replace />;
  }

  return (
    <div className="min-h-screen flex bg-black text-slate-100 font-sans selection:bg-neon-purple selection:text-white">
      {/* Dynamic Background for App pages (excluding Landing) */}
      {!isLanding && (
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-50" />
      )}
      
      {/* Lazy-loaded ThreeScene for better performance */}
      {isLanding && (
        <Suspense fallback={null}>
          <ThreeScene />
        </Suspense>
      )}
      
      {/* Sidebar for authenticated users */}
      {showSidebar && (
        <Sidebar 
          userRole={user?.role}
          userName={user?.name}
          userAvatar={user?.avatar}
        />
      )}

      {/* Main content wrapper */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'ml-20' : ''}`}>
        {/* Header for non-authenticated users (excluding landing) */}
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
            path="/placement/opportunities" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.PLACEMENT_OFFICER}>
                <ManageOpportunitiesPage />
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
          <Route 
            path="/placement/analytics" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.PLACEMENT_OFFICER}>
                <StudentAnalyticsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Faculty Mentor Routes */}
          <Route 
            path="/mentor/dashboard" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.FACULTY_MENTOR}>
                <MentorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentor/*" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.FACULTY_MENTOR}>
                <MentorDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Employer Routes */}
          <Route 
            path="/employer/dashboard" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.EMPLOYER}>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/post" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.EMPLOYER}>
                <PostOpportunityPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/candidates" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.EMPLOYER}>
                <CandidateSearchPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/*" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.EMPLOYER}>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Training Supervisor Routes */}
          <Route 
            path="/supervisor/*" 
            element={
              <ProtectedRoute userRole={user?.role} requiredRole={UserRole.TRAINING_SUPERVISOR}>
                <div className="pt-24 px-6">Training Supervisor Dashboard (Protected)</div>
        {/* Footer */}
        {showFooter && <Footer />}
      </div
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;