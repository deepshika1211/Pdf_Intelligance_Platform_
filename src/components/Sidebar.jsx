import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePDF } from '../context/PDFContext';
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  MessageSquare,
  Star,
  Clock,
  Settings,
  LogOut,
  Sparkles,
  HardDrive,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { logout, user } = useAuth();
  const { stats } = usePDF();
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
    { name: 'My PDFs', path: '/library', icon: FolderKanban, badge: stats.totalPdfs },
    { name: 'Upload PDF', path: '/upload', icon: UploadCloud, highlight: true },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare, badge: 'Pro' },
  ];

  const secondaryNavItems = [
    { name: 'Favorites', path: '/library?filter=favorites', icon: Star, count: stats.favoritesCount },
    { name: 'Recent Files', path: '/library?sort=recent', icon: Clock },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4 space-y-6">
      {/* User Quick Info */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 flex items-center space-x-3">
        <div className="relative">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/40"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{user?.name}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Platform Workspace
        </p>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge === 'Pro'
                      ? 'bg-gradient-to-r from-purpleBrand-500 to-cyanBrand-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Quick Filters Navigation */}
      <div className="space-y-1 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Quick Filters
        </p>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname + location.search === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Storage Quota Card */}
      <div className="mt-auto pt-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-cyanBrand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Storage Used</span>
            </div>
            <span className="text-xs font-bold text-cyanBrand-400">{stats.totalStorageMB} MB / 500 MB</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-purpleBrand-500 to-cyanBrand-500 rounded-full"
              style={{ width: `${Math.min((stats.totalStorageMB / 500) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">SOC2 Type II Encrypted</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[80vw] h-full glass-modal bg-slate-900 shadow-2xl border-r border-slate-800 z-10 overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-xs font-medium ${
                isActive ? 'text-brand-500 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
