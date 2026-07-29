/**
 * AuthContext.jsx — Real JWT Authentication Context
 * Connects Login/Register forms to the FastAPI /auth/* endpoints.
 * Persists JWT token and user info in localStorage.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // loading session on mount

  // ---------------------------------------------------------------------------
  // On mount: restore session from localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('pdf_intel_token');
      const savedUser = localStorage.getItem('pdf_intel_user');

      if (token && savedUser) {
        try {
          // Verify token is still valid by hitting /auth/me
          const res = await authAPI.me();
          setUser(res.data);
          setIsAuthenticated(true);
        } catch {
          // Token expired or invalid — clear storage
          localStorage.removeItem('pdf_intel_token');
          localStorage.removeItem('pdf_intel_user');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // ---------------------------------------------------------------------------
  // Login — POST /auth/login
  // ---------------------------------------------------------------------------
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;

    localStorage.setItem('pdf_intel_token', access_token);
    localStorage.setItem('pdf_intel_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // ---------------------------------------------------------------------------
  // Register — POST /auth/register
  // ---------------------------------------------------------------------------
  const register = async (fullName, email, password) => {
    const res = await authAPI.register({
      username: fullName,
      email,
      password,
    });
    const { access_token, user: userData } = res.data;

    localStorage.setItem('pdf_intel_token', access_token);
    localStorage.setItem('pdf_intel_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  // ---------------------------------------------------------------------------
  // Logout — clear token and state
  // ---------------------------------------------------------------------------
  const logout = () => {
    localStorage.removeItem('pdf_intel_token');
    localStorage.removeItem('pdf_intel_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // ---------------------------------------------------------------------------
  // Update API key in user profile (local state only)
  // ---------------------------------------------------------------------------
  const updateApiKey = (key) => {
    setUser((prev) => ({ ...prev, apiKey: key }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
