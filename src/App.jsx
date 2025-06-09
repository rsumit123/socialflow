import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setupAxiosInterceptors } from './Api';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat/Chat';
import ReportCards from './components/ReportCards';
import ReportCardDetail from './components/ReportCardDetail';
import PlatformPage from './components/PlatformPage';
import Categories from './components/Categories';
import Subcategories from './components/SubCategories';
import Lessons from './components/Lessons';
import IntroLessonDetail from './components/IntroLessonDetail';
import LearnMore from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TOS';
import LessonDetail from './components/LessonDetail/LessonDetail';
import BotSelection from './components/BotSelection';
import AllLessons from './components/AllLessons';
import { Box, CircularProgress } from '@mui/material';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  
  // Show a loading indicator while checking authentication
  if (initializing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Guest Route Component
const GuestRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  
  // Show a loading indicator while checking authentication
  if (initializing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return !user ? children : <Navigate to="/platform" />;
};

// Create a component to initialize the interceptor
const InitializeInterceptor = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  useEffect(() => {
    // Pass both navigate and logout to properly handle auth errors
    setupAxiosInterceptors(navigate, logout);
  }, [navigate, logout]);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <InitializeInterceptor />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/platform"
              element={
                <ProtectedRoute>
                  <PlatformPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                
                  <LearnMore />
                
              }
            />
            <Route
              path="/bots"
              element={
                  <BotSelection />
              }
            />
            <Route
              path="/chat/character/:id"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-cards"
              element={
                <ProtectedRoute>
                  <ReportCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-cards/:session_id"
              element={
                <ProtectedRoute>
                  <ReportCardDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/:categoryId"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/subcategories/:categoryId"
              element={
                <ProtectedRoute>
                  <Subcategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/lessons/:subcategoryId"
              element={
                <ProtectedRoute>
                  <Lessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/intro/:subcategoryId"
              element={
                <ProtectedRoute>
                  <IntroLessonDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/lessondetail/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-scenarios"
              element={
                <ProtectedRoute>
                  <AllLessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                
                  < PrivacyPolicy />
                
              }
            />
            <Route
              path="/terms"
              element={
                
                  <TermsOfService />
                
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;