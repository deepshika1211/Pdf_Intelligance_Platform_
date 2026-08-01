import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Book, Download, Trash2, CheckCircle2, ChevronDown, FileText, Bold, Italic, List } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

export default function PersonalNotes() {
  const { pdfs, currentPdf, setCurrentPdf } = usePDF();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const textareaRef = useRef(null);

  // Load notes when PDF changes
  useEffect(() => {
    if (currentPdf) {
      const saved = localStorage.getItem(`notes_${currentPdf.id}`);
      setNotes(saved || '');
    } else {
      setNotes('');
    }
  }, [currentPdf]);

  // Auto-save with debounce
  useEffect(() => {
    if (!currentPdf) return;
    
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem(`notes_${currentPdf.id}`, notes);
      setLastSaved(new Date());
      setIsSaving(false);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [notes, currentPdf]);

  const handleFormat = (format) => {
    const ta = textareaRef.current;
    if (!ta) return;
    
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = notes.substring(start, end);
    let newText = notes;
    let newCursor = end;

    if (format === 'bold') {
      newText = notes.substring(0, start) + `**${selected}**` + notes.substring(end);
      newCursor = end + 4;
    } else if (format === 'italic') {
      newText = notes.substring(0, start) + `_${selected}_` + notes.substring(end);
      newCursor = end + 2;
    } else if (format === 'bullet') {
      newText = notes.substring(0, start) + `\n- ${selected}` + notes.substring(end);
      newCursor = end + 3;
    }

    setNotes(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all notes for this PDF?')) {
      setNotes('');
      localStorage.removeItem(`notes_${currentPdf?.id}`);
    }
  };

  const handleDownload = () => {
    if (!notes || !currentPdf) return;
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Notes_${currentPdf.name.replace(/\\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <Book className="text-[#FF4400]" />
            Personal Notes
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Capture your thoughts and summaries securely in your browser.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <select 
            className="w-full appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 pr-10 text-zinc-900 dark:text-zinc-100 shadow-sm focus:ring-2 focus:ring-[#FF4400] focus:border-transparent outline-none"
            value={currentPdf?.id || ''}
            onChange={(e) => setCurrentPdf(pdfs.find(p => p.id === e.target.value))}
          >
            <option value="" disabled>Select PDF...</option>
            {pdfs.map(pdf => (
              <option key={pdf.id} value={pdf.id}>{pdf.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
        </div>
      </div>

      {!currentPdf ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <FileText size={32} className="text-zinc-400" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No Document Selected</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md">Select a PDF from the dropdown above to start taking notes.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <button onClick={() => handleFormat('bold')} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors" title="Bold">
                <Bold size={18} />
              </button>
              <button onClick={() => handleFormat('italic')} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors" title="Italic">
                <Italic size={18} />
              </button>
              <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
              <button onClick={() => handleFormat('bullet')} className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors" title="Bullet List">
                <List size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                {isSaving ? (
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin"/> Saving...</span>
                ) : showSavedMsg ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={14} /> Saved</motion.span>
                ) : lastSaved ? (
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                ) : null}
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700">
                  <Download size={16} /> <span className="hidden sm:inline">Download</span>
                </button>
                <button onClick={handleClear} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-900/30">
                  <Trash2 size={16} /> <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="relative flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJsaW5lcyIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMzIgTDEwMDAwIDMyIiBzdHJva2U9IiNlNWE1YTVhIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNsaW5lcykiIC8+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJsaW5lcyIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMzIgTDEwMDAwIDMyIiBzdHJva2U9IiMzZjNmNGYiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2xpbmVzKSIgLz48L3N2Zz4=')]">
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start typing your notes here..."
              className="absolute inset-0 w-full h-full resize-none bg-transparent p-6 outline-none text-zinc-800 dark:text-zinc-200 text-lg leading-[32px] placeholder:text-zinc-400"
              spellCheck="false"
            />
          </div>
        </div>
      )}
    </div>
  );
}
