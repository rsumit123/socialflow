// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Assume user is logged in if token exists
      setUser({ token });
      // Optionally, verify token validity with the backend here
    }
  }, []);

  // Add an interceptor to attach the token to outgoing requests on the main axios instance
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

      // Cleanup the interceptor on unmount or when token changes
      return () => {
        axios.interceptors.request.eject(interceptor);
      };
    }
  }, [user]);

  const register = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Return the entire response object so we can check status code in the component
      if (response.ok) {
        const data = await response.json();
        // Only set user if we're auto-logging in after registration
        // For this app, we're redirecting to login instead
        // localStorage.setItem('token', data.session.access_token);
        // setUser({ email, token: data.session.access_token });
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login/`, { email, password });
      if (response.data) {
        localStorage.setItem('token', response.data.session.access_token);
        setUser({ email, token: response.data.session.access_token });
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  // New guestLogin function
  const guestLogin = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/guest_login/`);
      if (response.data) {
        localStorage.setItem('token', response.data.session.access_token);
        // Optionally, you can update user state with additional info if returned by your endpoint.
        setUser({ token: response.data.session.access_token });
      }
    } catch (error) {
      console.error('Guest login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
