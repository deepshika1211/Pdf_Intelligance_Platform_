/**
 * PDFContext.jsx — Real Document Management Context
 * Fetches documents from FastAPI /documents/ on load.
 * Upload, delete, and manage PDFs with real backend state.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { documentsAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const PDFContext = createContext();

// Gradient colors to assign to new uploads visually
const THUMBNAIL_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-600 to-purple-700',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

/**
 * Maps a raw API document object to the shape the UI components expect.
 */
const mapApiDocToUi = (doc, index = 0) => ({
  id: `pdf-${doc.id}`,           // prefixed string ID for React keys
  dbId: doc.id,                  // raw numeric ID for API calls
  name: doc.filename,
  size: 'N/A',
  sizeBytes: 0,
  pages: doc.total_pages || 0,
  uploadDate: doc.upload_time || new Date().toISOString(),
  category: 'Uploads',
  tags: ['AI Indexed', 'OCR Parsed'],
  favorite: false,
  thumbnailBg: THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length],
  iconColor: 'text-indigo-500',
  summary: `${doc.filename} — ${doc.total_pages} pages indexed and ready for AI chat.`,
  highlights: [{ page: 1, text: 'Document indexed and available for semantic search.' }],
  title: doc.title || null,
  author: doc.author || null,
});

export const PDFProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [pdfs, setPdfs] = useState([]);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false);
  const [selectedPdfForViewer, setSelectedPdfForViewer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // ---------------------------------------------------------------------------
  // Fetch documents from backend on auth change
  // ---------------------------------------------------------------------------
  const fetchDocuments = useCallback(async () => {
    setIsLoadingPdfs(true);
    try {
      const res = await documentsAPI.list();
      const mapped = (res.data || []).map((doc, i) => mapApiDocToUi(doc, i));
      setPdfs(mapped);
    } catch (err) {
      console.warn('Could not fetch documents from backend:', err.message);
      setPdfs([]);
    } finally {
      setIsLoadingPdfs(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch once auth loading is done
    if (!authLoading) {
      fetchDocuments();
    }
  }, [authLoading, isAuthenticated, fetchDocuments]);

  // ---------------------------------------------------------------------------
  // Add PDF (called after successful upload — uses backend response data)
  // ---------------------------------------------------------------------------
  const addPdf = (newPdfData) => {
    const pdfObject = {
      id: `pdf-${newPdfData.dbId || Date.now()}`,
      dbId: newPdfData.dbId || null,
      name: newPdfData.name || 'Untitled_Document.pdf',
      size: newPdfData.size || 'N/A',
      sizeBytes: newPdfData.sizeBytes || 0,
      pages: newPdfData.pages || 0,
      uploadDate: new Date().toISOString(),
      category: newPdfData.category || 'Uploads',
      tags: newPdfData.tags || ['New Upload', 'AI Indexed'],
      favorite: false,
      thumbnailBg: THUMBNAIL_GRADIENTS[pdfs.length % THUMBNAIL_GRADIENTS.length],
      iconColor: 'text-indigo-500',
      summary: newPdfData.summary || 'Newly uploaded document indexed for AI analysis.',
      highlights: [{ page: 1, text: 'Document successfully parsed and vector embedded.' }],
    };
    setPdfs((prev) => [pdfObject, ...prev]);
    return pdfObject;
  };

  // ---------------------------------------------------------------------------
  // Delete PDF — calls backend API then removes from local state
  // ---------------------------------------------------------------------------
  const deletePdf = async (id) => {
    const pdf = pdfs.find((p) => p.id === id);
    if (pdf?.dbId) {
      try {
        await documentsAPI.delete(pdf.dbId);
      } catch (err) {
        console.warn('Backend delete failed:', err.message);
      }
    }
    setPdfs((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Local UI state mutations (no API call needed)
  // ---------------------------------------------------------------------------
  const toggleFavorite = (id) => {
    setPdfs((prev) =>
      prev.map((pdf) => (pdf.id === id ? { ...pdf, favorite: !pdf.favorite } : pdf))
    );
  };

  const renamePdf = (id, newName) => {
    setPdfs((prev) =>
      prev.map((pdf) => (pdf.id === id ? { ...pdf, name: newName } : pdf))
    );
  };

  // ---------------------------------------------------------------------------
  // Stats computed from current pdfs list
  // ---------------------------------------------------------------------------
  const totalPdfs = pdfs.length;
  const totalPages = pdfs.reduce((acc, curr) => acc + (curr.pages || 0), 0);
  const totalSizeBytes = pdfs.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const totalStorageMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const favoritesCount = pdfs.filter((pdf) => pdf.favorite).length;

  return (
    <PDFContext.Provider
      value={{
        pdfs,
        setPdfs,
        isLoadingPdfs,
        toggleFavorite,
        deletePdf,
        renamePdf,
        addPdf,
        fetchDocuments,
        selectedPdfForViewer,
        setSelectedPdfForViewer,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        stats: {
          totalPdfs,
          totalPages,
          totalStorageMB,
          favoritesCount,
        },
      }}
    >
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => useContext(PDFContext);
