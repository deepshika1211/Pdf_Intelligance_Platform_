import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  FileText, Download, Sparkles, Star, Calendar, HardDrive,
  BookOpen, Layers, CheckCircle2, Table2, Image, AlertCircle
} from 'lucide-react';
import { aiAPI, documentsAPI } from '../utils/api';

export const DocViewerModal = ({ pdf, isOpen, onClose, onChatWithDoc }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!pdf) return null;

  const handleGenerateSummary = async () => {
    if (!pdf.dbId) return;
    setSummaryLoading(true);
    try {
      const res = await aiAPI.summary(pdf.dbId);
      setSummaryText(res.data.summary);
    } catch {
      setSummaryText('⚠️ Could not generate summary. Make sure the backend is running and the document is indexed.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdf.dbId) {
      alert('No database ID for this document.');
      return;
    }
    setDownloading(true);
    try {
      const res = await documentsAPI.download(pdf.dbId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. The PDF file may not be available on the server.');
    } finally {
      setDownloading(false);
    }
  };

  const tabs = [
    { id: 'preview', label: 'PDF Preview', icon: FileText },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'highlights', label: `Highlights (${pdf.highlights?.length || 0})`, icon: CheckCircle2 },
    { id: 'tables', label: 'Tables', icon: Table2 },
    { id: 'images', label: 'Images', icon: Image },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pdf.name} maxWidth="max-w-4xl">
      <div className="space-y-5">
        {/* Document Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 text-sm">
          <div className="flex items-center space-x-6 flex-wrap gap-y-2">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span><strong>{pdf.pages}</strong> Pages</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <HardDrive className="w-4 h-4" style={{ color: '#F4AE52' }} />
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
        <div className="flex space-x-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Preview Tab */}
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
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{pdf.summary}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-4/5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* AI Summary Tab */}
          {activeTab === 'summary' && (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-semibold text-base" style={{ color: '#FF4400' }}>
                  <Sparkles className="w-5 h-5" />
                  <span>Real AI Summary — Powered by Groq Llama 3.3</span>
                </div>
                {!summaryText && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading || !pdf.dbId}
                  >
                    {summaryLoading ? 'Generating...' : 'Generate Summary'}
                  </Button>
                )}
              </div>
              {summaryLoading && (
                <div className="flex items-center space-x-3 text-sm text-slate-500">
                  <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span>AI is reading and summarizing your document...</span>
                </div>
              )}
              {summaryText && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 font-sans leading-relaxed">{summaryText}</pre>
                </div>
              )}
              {!summaryText && !summaryLoading && !pdf.dbId && (
                <div className="flex items-center space-x-2 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>This document needs to be uploaded via the backend to generate a real AI summary.</span>
                </div>
              )}
            </div>
          )}

          {/* Highlights Tab */}
          {activeTab === 'highlights' && (
            <div className="space-y-3">
              {pdf.highlights?.length > 0 ? (
                pdf.highlights.map((h, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start space-x-3">
                    <span className="shrink-0 font-mono text-xs px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 font-bold">
                      Page {h.page}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{h.text}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No highlights indexed yet. Chat with this PDF to generate highlights.</p>
                </div>
              )}
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              {pdf.tables && pdf.tables.length > 0 ? (
                pdf.tables.map((table, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                      <Table2 className="w-4 h-4 text-brand-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Table {idx + 1} — Page {table.page || '?'}</span>
                    </div>
                    <div className="overflow-x-auto p-3">
                      {table.data && table.data.length > 0 ? (
                        <table className="w-full text-xs border-collapse">
                          <tbody>
                            {table.data.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 dark:bg-slate-700 font-bold' : ''}>
                                {(Array.isArray(row) ? row : [row]).map((cell, cIdx) => (
                                  <td key={cIdx} className="border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-200">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-xs text-slate-400 p-2">{JSON.stringify(table)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                  <Table2 className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No tables were detected in this document.</p>
                  <p className="text-xs">Tables are extracted automatically when you upload a PDF.</p>
                </div>
              )}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <Image className="w-12 h-12 opacity-30" />
                {pdf.imagesCount > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {pdf.imagesCount} embedded image{pdf.imagesCount !== 1 ? 's' : ''} detected
                    </p>
                    <p className="text-xs text-center max-w-xs">
                      Images were extracted during processing. Full image preview will be available in a future update.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">No images were detected in this document.</p>
                    <p className="text-xs">Images are extracted automatically when you upload a PDF.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download PDF'}
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
