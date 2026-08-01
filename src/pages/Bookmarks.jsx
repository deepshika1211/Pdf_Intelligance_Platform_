import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Plus, Trash2, Filter, ChevronDown, BookOpen } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

const COLORS = [
  { id: 'blue', class: 'bg-blue-500', border: 'border-l-blue-500', text: 'text-blue-600 dark:text-blue-400', bgLight: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'rose', class: 'bg-rose-500', border: 'border-l-rose-500', text: 'text-rose-600 dark:text-rose-400', bgLight: 'bg-rose-50 dark:bg-rose-900/20' },
  { id: 'emerald', class: 'bg-emerald-500', border: 'border-l-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'amber', class: 'bg-amber-500', border: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-400', bgLight: 'bg-amber-50 dark:bg-amber-900/20' },
];

export default function Bookmarks() {
  const { pdfs } = usePDF();
  const [bookmarks, setBookmarks] = useState([]);
  const [filterPdf, setFilterPdf] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newPdfId, setNewPdfId] = useState('');
  const [newPage, setNewPage] = useState('');
  const [newText, setNewText] = useState('');
  const [newColor, setNewColor] = useState('blue');

  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const saveBookmarks = (newBookmarks) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newPdfId || !newPage || !newText) return;
    
    const pdf = pdfs.find(p => p.id === newPdfId);
    
    const newBookmark = {
      id: Date.now().toString(),
      pdfId: newPdfId,
      pdfName: pdf ? pdf.name : 'Unknown PDF',
      page: parseInt(newPage, 10),
      text: newText,
      color: newColor,
      createdAt: new Date().toISOString()
    };
    
    saveBookmarks([newBookmark, ...bookmarks]);
    
    // Reset form
    setNewPage('');
    setNewText('');
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const filteredBookmarks = filterPdf === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.pdfId === filterPdf);

  // Group by PDF Name for display
  const groupedBookmarks = filteredBookmarks.reduce((acc, curr) => {
    if (!acc[curr.pdfName]) acc[curr.pdfName] = [];
    acc[curr.pdfName].push(curr);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl text-white shadow-md" style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}>
              <Bookmark size={24} />
            </div>
            Bookmarks Manager
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Save and organize important pages and snippets from your documents.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <select 
              className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-zinc-900 dark:text-zinc-100 shadow-sm focus:ring-2 focus:ring-[#FF4400] outline-none"
              value={filterPdf}
              onChange={(e) => setFilterPdf(e.target.value)}
            >
              <option value="all">All Documents</option>
              {pdfs.map(pdf => (
                <option key={pdf.id} value={pdf.id}>{pdf.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium shadow-md transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}
          >
            <Plus size={20} /> <span className="hidden sm:inline">Add Bookmark</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-8 space-y-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Create New Bookmark</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Document</label>
                  <select required value={newPdfId} onChange={e => setNewPdfId(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#FF4400] text-zinc-900 dark:text-zinc-100">
                    <option value="" disabled>Select PDF...</option>
                    {pdfs.map(pdf => <option key={pdf.id} value={pdf.id}>{pdf.name}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Page Number</label>
                  <input type="number" required min="1" value={newPage} onChange={e => setNewPage(e.target.value)} placeholder="e.g. 42" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#FF4400] text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Snippet / Note</label>
                <textarea required value={newText} onChange={e => setNewText(e.target.value)} placeholder="What's important on this page?" className="w-full h-24 resize-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-[#FF4400] text-zinc-900 dark:text-zinc-100" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color Tag:</span>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button key={c.id} type="button" onClick={() => setNewColor(c.id)} className={`w-8 h-8 rounded-full ${c.class} ${newColor === c.id ? 'ring-4 ring-offset-2 ring-[#FF4400]/50 dark:ring-offset-zinc-900' : 'opacity-70 hover:opacity-100'} transition-all`} />
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-white font-medium shadow-md transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}>Save Bookmark</button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-16 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-300 dark:text-zinc-600 mb-6">
            <Bookmark size={48} />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">No Bookmarks Yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-lg mb-8">Keep track of important pages and notes by creating your first bookmark.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #FF4400 0%, #F4AE52 100%)' }}
          >
            <Plus size={20} /> Create Bookmark
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedBookmarks).map(([pdfName, marks]) => (
            <div key={pdfName} className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <BookOpen size={20} className="text-[#FF4400]" /> {pdfName}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {marks.map((mark) => {
                    const c = COLORS.find(col => col.id === mark.color) || COLORS[0];
                    return (
                      <motion.div 
                        key={mark.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 ${c.border}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${c.bgLight} ${c.text} mb-3`}>
                            Page {mark.page}
                          </div>
                          <button 
                            onClick={() => handleDelete(mark.id)}
                            className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete bookmark"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">{mark.text}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
                          Added {new Date(mark.createdAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
