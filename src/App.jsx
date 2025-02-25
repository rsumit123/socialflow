import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import Subcategories from './components/Subcategories';
import Lessons from './components/Lessons';
import LearnMore from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TOS';
import LessonDetail from './components/LessonDetail/LessonDetail';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Guest Route Component
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/platform" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
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
              path="/chat"
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
              path="/training/lessondetail/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonDetail />
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