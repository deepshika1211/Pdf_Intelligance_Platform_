import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePDF } from '../context/PDFContext';
import { useChat } from '../context/ChatContext';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HardDrive,
  FileCheck,
  Zap,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Upload = () => {
  const { addPdf } = usePDF();
  const { createNewSession } = useChat();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [addedPdfObj, setAddedPdfObj] = useState(null);
  const [uploadedHistory, setUploadedHistory] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.pdf')) {
      addToast('Please select a valid PDF document file (.pdf)', 'error');
      return;
    }

    setCurrentFile(file);
    setUploadState('uploading');
    setProgress(0);

    // Simulate chunked upload progress
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);

        // Add to PDF Context
        setTimeout(() => {
          const newPdf = addPdf({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            sizeBytes: file.size,
            pages: Math.floor(Math.random() * 25) + 10,
            category: 'Uploads',
            tags: ['User File', 'OCR Parsed'],
          });

          setAddedPdfObj(newPdf);
          setUploadedHistory((prev) => [newPdf, ...prev]);
          setUploadState('success');
          addToast(`Successfully processed "${file.name}"`, 'success');

          // Trigger Confetti!
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }, 400);
      } else {
        setProgress(current);
      }
    }, 250);
  };

  const resetUpload = () => {
    setUploadState('idle');
    setProgress(0);
    setCurrentFile(null);
    setAddedPdfObj(null);
  };

  const handleStartChat = () => {
    if (addedPdfObj) {
      createNewSession(addedPdfObj);
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Upload PDF Document
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Drag and drop your PDF to trigger automatic OCR text extraction, layout parsing, and dense vector indexing.
        </p>
      </div>

      {/* Main Drag & Drop Zone Card */}
      <Card className="p-8 sm:p-12 relative overflow-hidden">
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadState === 'idle' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purpleBrand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              Drag & Drop files here, or <span className="text-brand-500 underline">Browse</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Supported format: <strong>PDF</strong> • Maximum size: <strong>50 MB</strong>
            </p>

            <Button variant="primary" icon={UploadCloud} className="font-bold">
              Choose PDF File
            </Button>
          </div>
        )}

        {/* Uploading Progress State */}
        {uploadState === 'uploading' && (
          <div className="py-8 space-y-6 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-500 mx-auto flex items-center justify-center border border-brand-200 dark:border-brand-800 animate-pulse">
              <FileText className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Parsing & Indexing Document...
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate">
                {currentFile?.name}
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-brand-500 via-purpleBrand-500 to-cyanBrand-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Speed: 4.8 MB/s</span>
                <span className="font-bold text-brand-500">{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && addedPdfObj && (
          <div className="py-6 space-y-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                OCR & Dense Embeddings Complete
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                "{addedPdfObj.name}" is Ready!
              </h3>
              <p className="text-xs text-slate-500">
                Indexed {addedPdfObj.pages} pages • {addedPdfObj.size} • 0.2s OCR speed
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <Button variant="outline" icon={RefreshCw} onClick={resetUpload}>
                Upload Another
              </Button>
              <Button variant="primary" icon={Sparkles} onClick={handleStartChat} className="font-bold">
                Start AI Chat
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Uploads History */}
      {uploadedHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Newly Uploaded PDFs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uploadedHistory.map((pdf) => (
              <Card key={pdf.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-500 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{pdf.name}</h4>
                    <p className="text-[11px] text-slate-400">{pdf.pages} pages • {pdf.size}</p>
                  </div>
                </div>
                <Button size="sm" variant="accent" icon={Sparkles} onClick={() => { createNewSession(pdf); navigate('/chat'); }}>
                  Chat
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
