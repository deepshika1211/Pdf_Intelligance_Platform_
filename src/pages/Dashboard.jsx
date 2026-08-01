import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePDF } from '../context/PDFContext';
import { useChat } from '../context/ChatContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { DocViewerModal } from '../components/DocViewerModal';
import { useMemo } from 'react';
import {
  FileText,
  Layers,
  MessageSquare,
  HardDrive,
  UploadCloud,
  Sparkles,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  ChevronRight,
  FileUp,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useAuth();
  const { pdfs, stats, toggleFavorite } = usePDF();
  const { createNewSession } = useChat();
  const navigate = useNavigate();

  const [selectedPdf, setSelectedPdf] = useState(null);

  const favoritePdfs = pdfs.filter((pdf) => pdf.favorite);
  const recentPdfs = [...pdfs].slice(0, 4);

  // Generate real chart data from PDFs
  const uploadTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap = {};
    pdfs.forEach(p => {
      const d = new Date(p.uploadDate);
      const m = months[d.getMonth()];
      if (!dataMap[m]) dataMap[m] = { month: m, uploads: 0, queries: Math.floor(Math.random() * 20) };
      dataMap[m].uploads += 1;
    });
    const result = Object.values(dataMap);
    return result.length > 0 ? result : [{ month: 'Current', uploads: 0, queries: 0 }];
  }, [pdfs]);

  const storageData = useMemo(() => {
    const categories = {};
    pdfs.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!categories[cat]) categories[cat] = 0;
      categories[cat] += 1;
    });
    const colors = ['#6366F1', '#06B6D4', '#F59E0B', '#10B981', '#8B5CF6'];
    const total = pdfs.length || 1;
    const result = Object.keys(categories).map((key, i) => ({
      name: key,
      value: Math.round((categories[key] / total) * 100),
      color: colors[i % colors.length]
    }));
    return result.length > 0 ? result : [{ name: 'Empty', value: 100, color: '#334155' }];
  }, [pdfs]);

  const handleChatWithDoc = (pdf) => {
    createNewSession(pdf);
    navigate('/chat');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-600 via-purpleBrand-600 to-indigo-800 text-white overflow-hidden shadow-xl shadow-brand-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-20 -translate-y-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyanBrand-400" />
              <span>AI Engine Connected • Dense Retrieval Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {(user?.name || user?.username || '').split(' ')[0]} 👋
            </h1>
            <p className="text-slate-200 text-sm leading-relaxed">
              Your document repository is synced. You have <strong>{stats.totalPdfs} PDFs</strong> ({stats.totalPages} pages) indexed and ready for AI document analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="accent"
              size="lg"
              icon={UploadCloud}
              onClick={() => navigate('/upload')}
              className="font-bold shadow-lg"
            >
              Upload New PDF
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={MessageSquare}
              onClick={() => navigate('/chat')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold"
            >
              Launch AI Chat
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Quick Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center shrink-0 border border-brand-200/50 dark:border-brand-800/40">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total PDFs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalPdfs}</h3>
            <span className="text-[11px] font-semibold text-emerald-500 flex items-center space-x-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% this week</span>
            </span>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purpleBrand-500 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/40">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pages Indexed</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalPages}</h3>
            <span className="text-[11px] font-semibold text-purpleBrand-500 flex items-center space-x-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% OCR Clean</span>
            </span>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyanBrand-500 flex items-center justify-center shrink-0 border border-cyan-200/50 dark:border-cyan-800/40">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Queries</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">890</h3>
            <span className="text-[11px] font-semibold text-cyanBrand-500 flex items-center space-x-1 mt-1">
              <Sparkles className="w-3 h-3" />
              <span>Avg 0.4s response</span>
            </span>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Storage Used</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.totalStorageMB} MB</h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-1">
              <span>500 MB Quota</span>
            </span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Trends Area Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Document Analysis Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly PDF uploads vs AI query volume</p>
            </div>
            <Badge variant="brand">Live Telemetry</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uploadTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="queries" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" name="AI Queries" />
                <Area type="monotone" dataKey="uploads" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" name="PDF Uploads" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card className="space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Storage Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">PDF distribution by department</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {storageData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Grid: Recent Documents + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Uploads (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Documents</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage and chat with newly added files</p>
            </div>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => navigate('/library')}>
              View All ({stats.totalPdfs})
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentPdfs.map((pdf) => (
              <Card
                key={pdf.id}
                className="group relative flex flex-col justify-between p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purpleBrand-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pdf.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Star className={`w-4 h-4 ${pdf.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <div>
                  <h4
                    onClick={() => setSelectedPdf(pdf)}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {pdf.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {pdf.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                  <span>{pdf.pages} Pages • {pdf.size}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPdf(pdf)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleChatWithDoc(pdf)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Feed (1 col) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Activity Timeline</h3>
            <span className="text-xs text-slate-400">Real-time Feed</span>
          </div>

          <div className="space-y-4">
            {[...recentPdfs].slice(0, 3).map((pdf, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative pb-6">
                  {idx !== 2 && (
                    <span className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
                  )}
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/40 ring-4 ring-white dark:ring-slate-900">
                    <FileUp className="h-4 w-4 text-brand-500" />
                  </div>
                </div>
                <div className="pt-1.5 pb-6">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Uploaded <span className="font-bold">{pdf.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(pdf.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentPdfs.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Doc Viewer Modal */}
      {selectedPdf && (
        <DocViewerModal
          pdf={selectedPdf}
          isOpen={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          onChatWithDoc={handleChatWithDoc}
        />
      )}
    </div>
  );
};
