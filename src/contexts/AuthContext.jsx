// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Check token validity on initial load
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setInitializing(false);
          return;
        }

        // Validate the JWT token against the protected endpoint
        // With simplejwt, this is a local cryptographic check — no external calls
        try {
          await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/protected/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const email = localStorage.getItem('email');
          setUser({ token, email });
        } catch (error) {
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            setUser(null);
          } else {
            // Network error — still use the cached token
            console.warn("Error validating token but proceeding:", error);
            const email = localStorage.getItem('email');
            setUser({ token, email });
          }
        }
      } finally {
        setInitializing(false);
      }
    };

    validateToken();
  }, []);

  // Attach token to outgoing requests
  useEffect(() => {
    const token = user?.token;
    if (token) {
      const interceptor = axios.interceptors.request.use(
        (config) => {
          config.headers['Authorization'] = `Bearer ${token}`;
          return config;
        },
        (error) => Promise.reject(error)
      );

      return () => {
        axios.interceptors.request.eject(interceptor);
      };
    }
  }, [user]);

  const googleLogin = async (credential) => {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/google/`,
      { credential }
    );
    if (response.data) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('email', response.data.email);
      setUser({ token: response.data.access, email: response.data.email });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, googleLogin, logout, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};
