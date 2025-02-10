// src/App.jsx
import React from 'react';
import MaintenancePage from './components/MaintenancePage';

function App() {
  return <MaintenancePage />;
}

export default App;



// // src/App.jsx
// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import LandingPage from './components/LandingPage';
// import Login from './components/Login';
// import Register from './components/Register';
// import Chat from './components/Chat';
// import ReportCards from './components/ReportCards';
// import ReportCardDetail from './components/ReportCardDetail'; // Import the new component

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" />;
// };

// // Guest Route Component to prevent authenticated users from accessing login/register
// const GuestRoute = ({ children }) => {
//   const { user } = useAuth();
//   return !user ? children : <Navigate to="/chat" />;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Header />
//         <Suspense fallback={<div>Loading...</div>}>
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route
//               path="/login"
//               element={
//                 <GuestRoute>
//                   <Login />
//                 </GuestRoute>
//               }
//             />
//             <Route
//               path="/register"
//               element={
//                 <GuestRoute>
//                   <Register />
//                 </GuestRoute>
//               }
//             />
//             <Route
//               path="/chat"
//               element={
//                 <ProtectedRoute>
//                   <Chat />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/report-cards"
//               element={
//                 <ProtectedRoute>
//                   <ReportCards />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/report-cards/:session_id"
//               element={
//                 <ProtectedRoute>
//                   <ReportCardDetail />
//                 </ProtectedRoute>
//               }
//             />
//             {/* Redirect any unknown routes to LandingPage */}
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </Suspense>
//         <Footer />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
