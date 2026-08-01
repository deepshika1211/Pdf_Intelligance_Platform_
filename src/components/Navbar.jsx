import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePDF } from '../context/PDFContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAPI } from '../utils/api';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery, pdfs } = usePDF();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Semantic search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchAPI.semanticSearch(searchQuery);
        setSearchResults(res.data.results || []);
      } catch (e) {
        console.error('Search error', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            {/* Logo Icon — fully inline styled for reliability */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 50%, #C1EBE9 100%)',
              padding: 2,
              boxShadow: '0 4px 14px rgba(244,174,82,0.4)',
              flexShrink: 0,
              transition: 'transform 0.2s',
            }}
              className="group-hover:scale-105"
            >
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: 10,
                background: '#0A1728',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#F4AE52" fillOpacity="0.3" stroke="#F4AE52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6" stroke="#F4AE52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 13h6M9 17h4" stroke="#C1EBE9" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="18" cy="18" r="4" fill="#FF4400"/>
                  <path d="M18 16v2l1 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  PDF<span className="gradient-text">Intel</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(244,174,82,0.15)', color: '#FF4400', border: '1px solid rgba(244,174,82,0.4)' }}>
                  AI v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Document Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative z-50">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents semantically..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchModal(true);
              }}
              onFocus={() => setShowSearchModal(true)}
              className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-brand-500" />
            )}
            {!isSearching && !searchQuery && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                /
              </kbd>
            )}

            {/* Dropdown Results */}
            <AnimatePresence>
              {showSearchModal && searchQuery && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSearchModal(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="p-4 text-sm text-center text-slate-500">Searching AI index...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        <div className="px-3 pb-2 text-xs font-semibold text-brand-500 border-b border-slate-100 dark:border-slate-800">
                          Semantic Results
                        </div>
                        {searchResults.map((res, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              navigate('/chat');
                              setShowSearchModal(false);
                            }}
                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {res.document_name || 'Document'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                              "...{res.text}..."
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Page {res.page_number}</span>
                              <span className="text-emerald-500">{(res.score * 100).toFixed(0)}% Match</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-center text-slate-500">No semantic matches found.</div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Switcher */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Toggle Light / Dark Mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyanBrand-500 animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyanBrand-500" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 glass-modal rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</h4>
                    <span className="text-xs text-brand-500 font-medium">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto py-1">
                    <div className="py-2.5 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">PDF OCR Indexing Finished</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Q4_2025_Financial_Performance_Report.pdf fully processed.</p>
                        <span className="text-[10px] text-slate-400">2 mins ago</span>
                      </div>
                    </div>
                    <div className="py-2.5 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">AI Model Updated</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Upgraded to Antigravity Dense Vector Embeddings 2.4.</p>
                        <span className="text-[10px] text-slate-400">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/30"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg ring-2 ring-brand-500/30 flex items-center justify-center font-bold text-xs text-white"
                  style={{ background: 'linear-gradient(135deg, #FF4400, #F4AE52)' }}
                >
                  {(user?.name || user?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline font-semibold text-sm text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 glass-modal rounded-2xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 space-y-1"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                      {user?.plan}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
