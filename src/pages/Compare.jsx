import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, FileText, ChevronDown, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

export default function Compare() {
  const { pdfs } = usePDF();
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!doc1 || !doc2) return;
    if (doc1 === doc2) {
      setError("Please select two different documents to compare.");
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post(`/ai/compare?document_id_1=${doc1}&document_id_2=${doc2}`);
      setResult({
        doc1Name: pdfs.find(p => p.id === doc1)?.name || 'Document 1',
        doc2Name: pdfs.find(p => p.id === doc2)?.name || 'Document 2',
        comparison: res.data.comparison || 'Comparison analysis completed successfully.'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setDoc1('');
    setDoc2('');
    setError('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl shadow-lg mb-2" style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}>
          <GitCompare size={36} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Compare Documents</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Analyze similarities, extract differences, and synthesize information across multiple PDFs using AI.</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              
              {/* Doc 1 */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">First Document</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <select 
                    value={doc1}
                    onChange={e => setDoc1(e.target.value)}
                    className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-12 pr-10 py-4 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#FF4400] outline-none transition-all shadow-sm font-medium"
                  >
                    <option value="" disabled>Select PDF 1</option>
                    {pdfs.map(pdf => <option key={pdf.id} value={pdf.dbId}>{pdf.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* VS Divider */}
              <div className="hidden md:flex flex-col items-center justify-center px-4 mt-6">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border-4 border-white dark:border-zinc-900 shadow-sm z-10 relative">
                  VS
                </div>
              </div>

              {/* Doc 2 */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Second Document</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <select 
                    value={doc2}
                    onChange={e => setDoc2(e.target.value)}
                    className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-12 pr-10 py-4 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#FF4400] outline-none transition-all shadow-sm font-medium"
                  >
                    <option value="" disabled>Select PDF 2</option>
                    {pdfs.map(pdf => <option key={pdf.id} value={pdf.dbId}>{pdf.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
                </div>
              </div>

            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!doc1 || !doc2 || isLoading}
                className="group relative flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"/>
                      AI is analyzing both documents...
                    </>
                  ) : (
                    <>
                      Compare Documents <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Result Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left flex-1">
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] md:max-w-xs" title={result.doc1Name}>
                  {result.doc1Name}
                </div>
                <div className="text-zinc-400 font-bold">VS</div>
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] md:max-w-xs" title={result.doc2Name}>
                  {result.doc2Name}
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                New Comparison
              </button>
            </div>

            {/* Result Body */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">AI Comparison Analysis</h3>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300">
                <p className="whitespace-pre-wrap leading-relaxed">{result.comparison}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
