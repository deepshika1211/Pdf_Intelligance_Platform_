import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, HelpCircle, BookOpen, BookMarked, BarChart2, MessageSquare, Search, GitCompare, Zap, ChevronDown } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

const tools = [
  { id: 'flashcards', name: 'Flashcards', desc: 'Auto-generate study cards', icon: Brain, path: '/flashcards', color: 'from-pink-500 to-rose-500' },
  { id: 'quiz', name: 'AI Quiz', desc: 'Test your knowledge', icon: HelpCircle, path: '/quiz', color: 'from-blue-500 to-cyan-500' },
  { id: 'revision', name: 'Revision Notes', desc: 'Condense key concepts', icon: BookOpen, path: '/revision-notes', color: 'from-purple-500 to-indigo-500' },
  { id: 'glossary', name: 'AI Glossary', desc: 'Extract definitions', icon: BookMarked, path: '/glossary', color: 'from-emerald-500 to-teal-500' },
  { id: 'insights', name: 'AI Insights', desc: 'Deep dive analysis', icon: BarChart2, path: '/insights', color: 'from-orange-500 to-amber-500' },
  { id: 'chat', name: 'AI Chat', desc: 'Converse with your doc', icon: MessageSquare, path: '/chat', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'search', name: 'Semantic Search', desc: 'Find exact meanings', icon: Search, path: '#search', color: 'from-sky-500 to-blue-600' },
  { id: 'compare', name: 'Compare PDFs', desc: 'Find similarities & diffs', icon: GitCompare, path: '/compare', color: 'from-rose-500 to-orange-500' },
];

export default function AIWorkspace() {
  const navigate = useNavigate();
  const { pdfs, currentPdf, setCurrentPdf } = usePDF();
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleSummary = async () => {
    if (!currentPdf) return;
    setLoadingSummary(true);
    try {
      const res = await api.post('/ai/summary', { document_id: currentPdf.id });
      setSummary(res.data.summary || 'Summary generated successfully.');
    } catch (error) {
      console.error(error);
      setSummary('Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-10 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">AI Workspace</h1>
          <p className="text-lg opacity-90 max-w-2xl text-white/90 font-medium">Supercharge your learning with AI-powered tools tailored for your documents.</p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-20 transform translate-x-1/4 -translate-y-1/4">
          <Zap size={200} />
        </div>
      </div>

      {/* PDF Selector */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Active Document</label>
        <div className="relative">
          <select 
            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#FF4400] focus:border-transparent transition-all outline-none"
            value={currentPdf?.id || ''}
            onChange={(e) => setCurrentPdf(pdfs.find(p => p.id === e.target.value))}
          >
            <option value="" disabled>Select a PDF to begin...</option>
            {pdfs.map(pdf => (
              <option key={pdf.id} value={pdf.id}>{pdf.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
              onClick={() => tool.path.startsWith('#') ? alert('Search invoked (Use navbar search)') : navigate(tool.path)}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{tool.name}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm flex-grow mb-6">{tool.desc}</p>
              
              <button className="w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700">
                Launch
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Summary */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Quick AI Summary</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Get an instant overview of your active document.</p>
          </div>
          <button 
            onClick={handleSummary}
            disabled={!currentPdf || loadingSummary}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-md disabled:opacity-50 transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}
          >
            {loadingSummary ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Zap size={20} />}
            {loadingSummary ? 'Analyzing...' : 'Generate Summary'}
          </button>
        </div>

        {summary && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 prose dark:prose-invert max-w-none"
          >
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed m-0 whitespace-pre-wrap">{summary}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
