
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home'; // Newly added Home component
import Chat from './components/Chat';
import JustChat from './components/JustChat';
import ReportCards from './components/ReportCards';
import ReportCardDetail from './components/ReportCardDetail'; // Import the new component

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Guest Route Component to prevent authenticated users from accessing login/register
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/home" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Landing page remains for non-logged in users */}
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
            {/* Authenticated users see the Home screen */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            {/* Other protected routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/justchat"
              element={
                <ProtectedRoute>
                  <JustChat />
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
            {/* Redirect any unknown routes to LandingPage */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
