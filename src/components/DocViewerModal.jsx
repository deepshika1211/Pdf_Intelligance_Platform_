import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { FileText, Download, Sparkles, Star, Calendar, HardDrive, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const DocViewerModal = ({ pdf, isOpen, onClose, onChatWithDoc }) => {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'highlights' | 'summary'

  if (!pdf) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pdf.name} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Document Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span><strong>{pdf.pages}</strong> Pages</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <HardDrive className="w-4 h-4 text-purpleBrand-500" />
              <span><strong>{pdf.size}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-cyanBrand-500" />
              <span>{new Date(pdf.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="brand">{pdf.category || 'Document'}</Badge>
            {pdf.favorite && (
              <Badge variant="amber" className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Starred</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            PDF Page View
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'summary'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            AI Document Summary
          </button>
          <button
            onClick={() => setActiveTab('highlights')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'highlights'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Extracted Key Highlights ({pdf.highlights?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'preview' && (
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-brand-500" />
                    <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Page 1 of {pdf.pages}</span>
                  </div>
                  <span className="text-xs bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded font-mono">OCR Clean</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{pdf.name.replace('.pdf', '')}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pdf.summary}
                </p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-4/5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center space-x-2 text-brand-500 font-semibold text-base">
                <Sparkles className="w-5 h-5" />
                <span>AI Core Analysis & Abstract</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {pdf.summary}
              </p>
              <div className="pt-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Applied Taxonomy Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {pdf.tags?.map((t, idx) => (
                    <Badge key={idx} variant="purple">{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'highlights' && (
            <div className="space-y-3">
              {pdf.highlights?.map((h, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start space-x-3">
                  <span className="shrink-0 font-mono text-xs px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 font-bold">
                    Page {h.page}
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{h.text}</p>
                </div>
              )) || <p className="text-sm text-slate-500">No highlights indexed yet.</p>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" icon={Download} onClick={onClose}>
            Download PDF
          </Button>
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={() => {
              onClose();
              if (onChatWithDoc) onChatWithDoc(pdf);
            }}
          >
            Ask AI About This PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
