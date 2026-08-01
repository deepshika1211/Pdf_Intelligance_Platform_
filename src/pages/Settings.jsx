import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePDF } from '../context/PDFContext';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import {
  User,
  Key,
  Sun,
  Moon,
  HardDrive,
  Bell,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  Save,
  Sparkles
} from 'lucide-react';

export const Settings = () => {
  const { user, setUser, updateApiKey } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { stats } = usePDF();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'apikeys' | 'appearance' | 'storage'
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser((prev) => ({ ...prev, name, email }));
    addToast('Profile updated successfully', 'success');
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    updateApiKey(apiKey);
    addToast('API Key updated and stored securely', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account & Platform Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal profile, custom LLM API keys, dark theme preferences, and storage quota.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'profile'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'apikeys'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'appearance'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'storage'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Storage</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-500/20"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl ring-4 ring-brand-500/20 flex items-center justify-center font-bold text-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #FF4400, #F4AE52)' }}
              >
                {(user?.name || user?.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.role} • {user?.plan}</p>
              <Badge variant="brand" className="mt-1">SOC2 Compliant Account</Badge>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button type="submit" variant="primary" icon={Save} className="font-bold">
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'apikeys' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Custom Model API Key</h3>
            <p className="text-xs text-slate-500">Provide your custom OpenAI or Anthropic key to enable high-throughput dense OCR synthesis.</p>
          </div>

          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">OpenAI / Antigravity Secret Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" icon={Key} className="font-bold">
              Update API Key
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Theme & Display Settings</h3>
            <p className="text-xs text-slate-500">Toggle between Light and Dark mode options.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { if (isDark) toggleTheme(); }}
              className={`p-6 rounded-2xl border text-center space-y-3 transition-all ${
                !isDark
                  ? 'border-brand-500 bg-brand-50/40 text-brand-600 font-bold ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Sun className="w-8 h-8 mx-auto text-amber-500" />
              <p className="text-sm">Light Mode</p>
            </button>

            <button
              onClick={() => { if (!isDark) toggleTheme(); }}
              className={`p-6 rounded-2xl border text-center space-y-3 transition-all ${
                isDark
                  ? 'border-brand-500 bg-slate-900 text-brand-400 font-bold ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Moon className="w-8 h-8 mx-auto text-indigo-400" />
              <p className="text-sm">Dark Mode</p>
            </button>
          </div>
        </Card>
      )}

      {activeTab === 'storage' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Storage Capacity & Usage</h3>
            <p className="text-xs text-slate-500">Enterprise SOC2 Type II encrypted cloud volume.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>{stats.totalStorageMB} MB used of 500 MB quota</span>
              <span className="font-bold text-cyanBrand-400">{Math.round((stats.totalStorageMB / 500) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-purpleBrand-500 to-cyanBrand-500"
                style={{ width: `${Math.min((stats.totalStorageMB / 500) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
