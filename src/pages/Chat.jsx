import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { usePDF } from '../context/PDFContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import {
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  FileText,
  Copy,
  Check,
  Bot,
  User,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Maximize2,
  Minimize2,
  Paperclip,
  ExternalLink,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Chat = () => {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    sendMessage,
    createNewSession,
    isTyping,
  } = useChat();

  const { pdfs } = usePDF();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedTargetPdf, setSelectedTargetPdf] = useState(pdfs[0]);
  const [showPdfSidePanel, setShowPdfSidePanel] = useState(false);
  const [activeCitationSnippet, setActiveCitationSnippet] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText, selectedTargetPdf);
    setInputText('');
  };

  const handleSuggestedPrompt = (promptText) => {
    sendMessage(promptText, selectedTargetPdf);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    { text: 'Summarize this PDF', icon: '📝' },
    { text: 'Find important dates', icon: '📅' },
    { text: 'Extract tables', icon: '📊' },
    { text: 'Generate quiz', icon: '🧠' },
    { text: 'Explain this chapter', icon: '💡' },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Panel: Conversation Threads & Target PDF Picker */}
      <div className="w-full md:w-72 shrink-0 glass-card rounded-2xl p-4 flex flex-col justify-between space-y-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          {/* New Chat Button */}
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => createNewSession(selectedTargetPdf)}
            className="w-full font-bold shadow-md"
          >
            New AI Session
          </Button>

          {/* Active Target PDF Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Context Document
            </label>
            <select
              value={selectedTargetPdf?.id || ''}
              onChange={(e) => {
                const found = pdfs.find((p) => p.id === e.target.value);
                setSelectedTargetPdf(found);
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 truncate"
            >
              {pdfs.map((pdf) => (
                <option key={pdf.id} value={pdf.id}>
                  {pdf.name} ({pdf.pages} p)
                </option>
              ))}
            </select>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Recent Threads
            </p>
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-brand-500 text-white font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{s.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            icon={BookOpen}
            onClick={() => setShowPdfSidePanel(!showPdfSidePanel)}
            className="w-full text-xs font-semibold"
          >
            {showPdfSidePanel ? 'Hide Document Preview' : 'Side-by-Side PDF Viewer'}
          </Button>
        </div>
      </div>

      {/* Center Main Workspace: Chat Messages */}
      <div className="flex-1 flex flex-col glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 via-purpleBrand-500 to-cyanBrand-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {activeSession?.title || 'AI Document Assistant'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 truncate">
                <FileText className="w-3 h-3 text-brand-500 shrink-0" />
                <span className="truncate">Context: {selectedTargetPdf?.name}</span>
              </p>
            </div>
          </div>

          <Badge variant="cyan" className="hidden sm:inline-flex">
            GPT-4o + Vector OCR
          </Badge>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSession?.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-brand-500 text-white'
                      : 'bg-gradient-to-br from-slate-800 to-slate-950 text-cyanBrand-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Citations Pills */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Verified Document Sources:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((cite, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveCitationSnippet(cite);
                                setShowPdfSidePanel(true);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[11px] font-mono hover:scale-105 transition-transform"
                            >
                              <BookOpen className="w-3 h-3 text-brand-500" />
                              <span>Page {cite.page}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Timestamp */}
                  <div className={`flex items-center space-x-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyanBrand-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purpleBrand-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-cyanBrand-500 animate-bounce delay-200" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto flex items-center space-x-2 scrollbar-none bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Prompts:</span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedPrompt(p.text)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-400 shrink-0 transition-colors shadow-sm flex items-center space-x-1"
            >
              <span>{p.icon}</span>
              <span>{p.text}</span>
            </button>
          ))}
        </div>

        {/* Bottom Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={`Ask any question about ${selectedTargetPdf?.name || 'document'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 p-2 rounded-lg"
              icon={Send}
            />
          </div>
        </form>
      </div>

      {/* Right Side Panel: PDF Document Previewer (Side-by-Side Toggle) */}
      <AnimatePresence>
        {showPdfSidePanel && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="w-full md:w-80 shrink-0 glass-card rounded-2xl p-4 flex flex-col justify-between border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[160px]">
                  {selectedTargetPdf?.name}
                </h4>
              </div>
              <button
                onClick={() => setShowPdfSidePanel(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Citation Snippet Inspector */}
            {activeCitationSnippet ? (
              <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                  Target Citation • Page {activeCitationSnippet.page}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-mono italic">
                  "{activeCitationSnippet.snippet}"
                </p>
              </div>
            ) : null}

            {/* Rendered Mock Page View */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Page 1 of {selectedTargetPdf?.pages}</span>
                <span>OCR Clean</span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                {selectedTargetPdf?.name.replace('.pdf', '')}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedTargetPdf?.summary}
              </p>
              <div className="space-y-1.5 pt-2">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
