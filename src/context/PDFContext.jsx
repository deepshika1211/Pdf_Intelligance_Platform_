import React, { createContext, useContext, useState } from 'react';
import { INITIAL_PDFS } from '../utils/mockData';

const PDFContext = createContext();

export const PDFProvider = ({ children }) => {
  const [pdfs, setPdfs] = useState(INITIAL_PDFS);
  const [selectedPdfForViewer, setSelectedPdfForViewer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'size'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const toggleFavorite = (id) => {
    setPdfs((prev) =>
      prev.map((pdf) =>
        pdf.id === id ? { ...pdf, favorite: !pdf.favorite } : pdf
      )
    );
  };

  const deletePdf = (id) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
  };

  const renamePdf = (id, newName) => {
    setPdfs((prev) =>
      prev.map((pdf) =>
        pdf.id === id ? { ...pdf, name: newName } : pdf
      )
    );
  };

  const addPdf = (newPdf) => {
    const pdfObject = {
      id: `pdf-${Date.now()}`,
      name: newPdf.name || 'Untitled_Document.pdf',
      size: newPdf.size || '3.5 MB',
      sizeBytes: newPdf.sizeBytes || 3670016,
      pages: newPdf.pages || Math.floor(Math.random() * 30) + 5,
      uploadDate: new Date().toISOString(),
      category: newPdf.category || 'General',
      tags: newPdf.tags || ['New Upload', 'AI Indexed'],
      favorite: false,
      thumbnailBg: 'from-indigo-600 to-purple-600',
      iconColor: 'text-indigo-500',
      summary: newPdf.summary || 'Newly uploaded document parsed and vectors generated for AI analysis.',
      highlights: [
        { page: 1, text: 'Document successfully parsed and chunked into vector embeddings.' }
      ]
    };
    setPdfs((prev) => [pdfObject, ...prev]);
    return pdfObject;
  };

  // Stats calculation
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
        toggleFavorite,
        deletePdf,
        renamePdf,
        addPdf,
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
