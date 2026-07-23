import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PDFProvider } from './context/PDFContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './components/Toast';

import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Library } from './pages/Library';
import { Upload } from './pages/Upload';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PDFProvider>
          <ChatProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected SaaS App Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="library" element={<Library />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* Fallback Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </ChatProvider>
        </PDFProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
