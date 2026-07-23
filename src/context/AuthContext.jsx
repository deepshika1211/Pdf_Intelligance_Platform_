import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Aiden Morgan',
    email: 'aiden.morgan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    role: 'Product Engineer',
    plan: 'Pro Tier',
    apiKey: 'sk-pdf-intel-live-89f7a6b2c4e1d3e5',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email, password) => {
    setIsAuthenticated(true);
    setUser((prev) => ({
      ...prev,
      email: email || prev.email,
      name: email ? email.split('@')[0].replace('.', ' ') : prev.name,
    }));
  };

  const register = (fullName, email) => {
    setIsAuthenticated(true);
    setUser((prev) => ({
      ...prev,
      name: fullName || 'New User',
      email: email || 'user@example.com',
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateApiKey = (key) => {
    setUser((prev) => ({ ...prev, apiKey: key }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
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
