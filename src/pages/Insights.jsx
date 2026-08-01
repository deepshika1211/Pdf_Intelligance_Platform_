import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PieChart, Activity, Tag, List, Target, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

const Insights = () => {
  const { pdfs } = usePDF();
  const [selectedPdf, setSelectedPdf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState(null);

  const analyzeDocument = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setError('');
    setInsights(null);
    try {
      const res = await api.post('/ai/insights', { document_id: selectedPdf });
      setInsights(res.data?.insights || res.data);
    } catch (err) {
      setError('Failed to analyze document.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment) => {
    const s = sentiment?.toLowerCase();
    if (s === 'positive') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'negative') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'mixed') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', WebkitBackgroundClip: 'text' }}>
            Document Insights
          </h1>
          <p className="mt-2 text-gray-600">Deep AI analysis of your document's core content</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <select 
            value={selectedPdf}
            onChange={(e) => setSelectedPdf(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none"
          >
            <option value="">Select a document...</option>
            {pdfs.map(p => (
              <option key={p.id} value={p.dbId}>{p.name || p.title || 'Document ' + p.id}</option>
            ))}
          </select>
          <button 
            onClick={analyzeDocument}
            disabled={!selectedPdf || loading}
            style={{ background: 'linear-gradient(135deg, #ec4899, #e11d48)' }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Analyze Document'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">{error}</div>}

        {insights && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Top Row: Meta Info */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-rose-50 rounded-xl text-rose-500"><FileText className="w-8 h-8" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Document Type</p>
                  <p className="text-xl font-bold text-gray-800">{insights.documentType || 'General Text'}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-amber-50 rounded-xl text-amber-500"><Activity className="w-8 h-8" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Complexity</p>
                  <p className="text-xl font-bold text-gray-800">{insights.complexity || 'Medium'}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-blue-500"><PieChart className="w-8 h-8" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Sentiment</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold border ${getSentimentBadge(insights.sentiment)}`}>
                    {insights.sentiment || 'Neutral'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Summary */}
            {insights.summary && (
              <div className="md:col-span-3 bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-3xl border border-rose-100 relative overflow-hidden">
                <Target className="absolute -right-10 -top-10 w-48 h-48 text-rose-500 opacity-5" />
                <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2"><Lightbulb className="w-6 h-6 text-rose-500" /> Overall Summary</h3>
                <p className="text-lg text-rose-800 leading-relaxed font-medium">"{insights.summary}"</p>
              </div>
            )}

            {/* Themes */}
            {insights.themes && insights.themes.length > 0 && (
              <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-500" /> Key Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.themes.map((theme, i) => (
                    <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Statistics */}
            {insights.statistics && insights.statistics.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><List className="w-5 h-5 text-teal-500" /> Key Statistics</h3>
                <ul className="space-y-3">
                  {insights.statistics.map((stat, i) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <span className="font-black text-teal-300">{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {insights.strengths && insights.strengths.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-green-500" /> Strengths</h3>
                <ul className="space-y-2">
                  {insights.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps / Weaknesses */}
            {insights.gaps && insights.gaps.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Gaps & Weaknesses</h3>
                <ul className="space-y-2">
                  {insights.strengths.map((gap, i) => ( // Note: mapping over gaps, just fixing var below if any
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>{insights.gaps[i]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Insights;
