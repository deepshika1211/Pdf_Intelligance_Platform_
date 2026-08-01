import React, { Suspense, lazy } from 'react';
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
import { LoadingSpinner } from './components/Loader';

// Lazy-load new AI feature pages for faster initial load
const AIWorkspace = lazy(() => import('./pages/AIWorkspace'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Quiz = lazy(() => import('./pages/Quiz'));
const RevisionNotes = lazy(() => import('./pages/RevisionNotes'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Insights = lazy(() => import('./pages/Insights'));
const PersonalNotes = lazy(() => import('./pages/PersonalNotes'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Compare = lazy(() => import('./pages/Compare'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
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
                    {/* Core Pages */}
                    <Route index element={<Dashboard />} />
                    <Route path="library" element={<Library />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="settings" element={<Settings />} />

                    {/* AI Feature Pages */}
                    <Route path="workspace" element={<Suspense fallback={<PageLoader />}><AIWorkspace /></Suspense>} />
                    <Route path="flashcards" element={<Suspense fallback={<PageLoader />}><Flashcards /></Suspense>} />
                    <Route path="quiz" element={<Suspense fallback={<PageLoader />}><Quiz /></Suspense>} />
                    <Route path="revision-notes" element={<Suspense fallback={<PageLoader />}><RevisionNotes /></Suspense>} />
                    <Route path="glossary" element={<Suspense fallback={<PageLoader />}><Glossary /></Suspense>} />
                    <Route path="insights" element={<Suspense fallback={<PageLoader />}><Insights /></Suspense>} />
                    <Route path="notes" element={<Suspense fallback={<PageLoader />}><PersonalNotes /></Suspense>} />
                    <Route path="bookmarks" element={<Suspense fallback={<PageLoader />}><Bookmarks /></Suspense>} />
                    <Route path="compare" element={<Suspense fallback={<PageLoader />}><Compare /></Suspense>} />
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
