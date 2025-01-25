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
        (error) => {
          return Promise.reject(error);
        }
      );

      // Cleanup the interceptor on unmount or when token changes
      return () => {
        axios.interceptors.request.eject(interceptor);
      };
    }
  }, [user]);

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register/`, {
        email,
        password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({ email, token: response.data.token });
        return response.data; // Optional: return data in case it needs to be used
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login/`, { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser({ email, token: response.data.token });
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};