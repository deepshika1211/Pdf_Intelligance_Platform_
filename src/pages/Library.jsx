import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePDF } from '../context/PDFContext';
import { useChat } from '../context/ChatContext';
import { useToast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DocViewerModal } from '../components/DocViewerModal';
import {
  Search,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  FileText,
  Star,
  Trash2,
  Edit2,
  Download,
  Sparkles,
  MoreVertical,
  Calendar,
  Layers,
  HardDrive,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Library = () => {
  const {
    pdfs,
    toggleFavorite,
    deletePdf,
    renamePdf,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
  } = usePDF();

  const { createNewSession } = useChat();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active filter params from URL
  const urlFilter = searchParams.get('filter');
  const urlSort = searchParams.get('sort');

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [docToRename, setDocToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [docToDelete, setDocToDelete] = useState(null);
  const [selectedPdfForModal, setSelectedPdfForModal] = useState(null);

  const categories = ['All', 'Finance', 'Engineering', 'Legal', 'Product', 'Security', 'Strategy'];

  // Filtering logic
  let filtered = pdfs.filter((pdf) => {
    const matchesQuery =
      pdf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'All' || pdf.category === selectedTag;
    const matchesFavorites = urlFilter === 'favorites' ? pdf.favorite : true;

    return matchesQuery && matchesTag && matchesFavorites;
  });

  // Sorting logic
  filtered.sort((a, b) => {
    if (sortBy === 'newest' || urlSort === 'recent') {
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    } else if (sortBy === 'oldest') {
      return new Date(a.uploadDate) - new Date(b.uploadDate);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'size') {
      return b.sizeBytes - a.sizeBytes;
    } else if (sortBy === 'pages') {
      return b.pages - a.pages;
    }
    return 0;
  });

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (docToRename && renameValue.trim()) {
      renamePdf(docToRename.id, renameValue.trim());
      addToast(`Renamed to "${renameValue.trim()}"`, 'success');
      setDocToRename(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      deletePdf(docToDelete.id);
      addToast(`Deleted ${docToDelete.name}`, 'info');
      setDocToDelete(null);
    }
  };

  const handleChat = (pdf) => {
    createNewSession(pdf);
    navigate('/chat');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {urlFilter === 'favorites' ? 'Starred Favorites' : 'PDF Document Library'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} document(s) available for search, OCR analysis, and AI chat.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Sparkles}
          onClick={() => navigate('/upload')}
          className="self-start md:self-auto font-bold"
        >
          Upload PDF
        </Button>
      </div>

      {/* Control Bar: Search, Category Chips, Sort & View Mode */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="pages">Sort by Page Count</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-brand-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-brand-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tag Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedTag(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                selectedTag === cat
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Document Library Display */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No PDFs found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Try adjusting your search terms or filters, or upload a new PDF document.
          </p>
          <Button variant="primary" icon={Sparkles} onClick={() => navigate('/upload')}>
            Upload First PDF
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pdf) => (
            <Card
              key={pdf.id}
              className="group relative flex flex-col justify-between p-5 space-y-4"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between">
                {/* Styled Thumbnail Box */}
                <div className={`w-12 h-14 rounded-xl bg-gradient-to-br ${pdf.thumbnailBg} text-white p-2.5 flex flex-col justify-between shadow-lg shadow-indigo-500/10`}>
                  <FileText className="w-5 h-5" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-80">PDF</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => toggleFavorite(pdf.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${pdf.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === pdf.id ? null : pdf.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === pdf.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-0 mt-1 w-44 glass-modal rounded-xl p-1.5 shadow-2xl border border-slate-200 dark:border-slate-800 z-30 space-y-1 text-xs"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setSelectedPdfForModal(pdf);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-brand-500" />
                            <span>Open Details</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDocToRename(pdf);
                              setRenameValue(pdf.name);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-purpleBrand-500" />
                            <span>Rename PDF</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              addToast(`Downloading ${pdf.name}...`, 'info');
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Download className="w-3.5 h-3.5 text-cyanBrand-500" />
                            <span>Download File</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDocToDelete(pdf);
                            }}
                            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete PDF</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h3
                  onClick={() => setSelectedPdfForModal(pdf)}
                  className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1 cursor-pointer"
                >
                  {pdf.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {pdf.summary}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {pdf.tags?.map((t, idx) => (
                  <Badge key={idx} variant="brand" size="sm">{t}</Badge>
                ))}
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                <span>{pdf.pages} Pages • {pdf.size}</span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => handleChat(pdf)}
                >
                  AI Chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
          {filtered.map((pdf) => (
            <div
              key={pdf.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pdf.thumbnailBg} text-white flex items-center justify-center shrink-0 shadow-md`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4
                    onClick={() => setSelectedPdfForModal(pdf)}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-500 transition-colors truncate cursor-pointer"
                  >
                    {pdf.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {pdf.pages} pages • {pdf.size} • Uploaded {new Date(pdf.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Badge variant="purple">{pdf.category}</Badge>
                <button
                  onClick={() => toggleFavorite(pdf.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                >
                  <Star className={`w-4 h-4 ${pdf.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
                <Button variant="outline" size="sm" icon={FolderOpen} onClick={() => setSelectedPdfForModal(pdf)}>
                  Details
                </Button>
                <Button variant="primary" size="sm" icon={Sparkles} onClick={() => handleChat(pdf)}>
                  Ask AI
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Rename Modal */}
      {docToRename && (
        <Modal
          isOpen={!!docToRename}
          onClose={() => setDocToRename(null)}
          title="Rename PDF Document"
        >
          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                Document File Name
              </label>
              <input
                type="text"
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setDocToRename(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <Modal
          isOpen={!!docToDelete}
          onClose={() => setDocToDelete(null)}
          title="Confirm Document Deletion"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete <strong>"{docToDelete.name}"</strong>? All associated dense vector embeddings and chat history will be removed.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setDocToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleDeleteConfirm}>
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Detail Viewer Modal */}
      {selectedPdfForModal && (
        <DocViewerModal
          pdf={selectedPdfForModal}
          isOpen={!!selectedPdfForModal}
          onClose={() => setSelectedPdfForModal(null)}
          onChatWithDoc={handleChat}
        />
      )}
    </div>
  );
};
