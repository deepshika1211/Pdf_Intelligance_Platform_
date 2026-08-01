import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

const Flashcards = () => {
  const { pdfs } = usePDF();
  const [selectedPdf, setSelectedPdf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const generateFlashcards = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setError('');
    setFlashcards([]);
    try {
      const res = await api.post('/ai/flashcards', { document_id: selectedPdf, num_items: 10 });
      setFlashcards(res.data?.flashcards || res.data || []);
      setCurrentIndex(0);
      setFlipped(false);
      setKnownCount(0);
    } catch (err) {
      setError('Failed to generate flashcards.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
    }, 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  const markKnown = () => {
    setKnownCount((prev) => prev + 1);
    handleNext();
  };

  const markUnknown = () => {
    handleNext();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #FF4400, #F4AE52)', WebkitBackgroundClip: 'text' }}>
            Flashcards Study
          </h1>
          <p className="mt-2 text-gray-600">Master your documents with AI-generated flashcards</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <select 
            value={selectedPdf}
            onChange={(e) => setSelectedPdf(e.target.value)}
            className="w-full sm:w-2/3 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF4400] outline-none"
          >
            <option value="">Select a document...</option>
            {pdfs.map(p => (
              <option key={p.id} value={p.dbId}>{p.name || p.title || 'Document ' + p.id}</option>
            ))}
          </select>
          <button 
            onClick={generateFlashcards}
            disabled={!selectedPdf || loading}
            style={{ background: 'linear-gradient(135deg, #FF4400, #F4AE52)' }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Flashcards'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {flashcards.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500">
              <span>Card {currentIndex + 1} of {flashcards.length}</span>
              <span>Known: {knownCount}</span>
            </div>
            
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF4400] transition-all duration-300"
                style={{ width: `${(currentIndex / flashcards.length) * 100}%` }}
              />
            </div>

            <div className="relative w-full aspect-video md:aspect-[2/1] mx-auto cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(!flipped)}>
              <div 
                className="w-full h-full relative" 
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', 
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)' 
                }}
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    {flashcards[currentIndex].front || flashcards[currentIndex].question}
                  </h3>
                  <div className="absolute bottom-4 text-gray-400 text-sm">Click to flip</div>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <p className="text-xl md:text-2xl text-gray-700">
                    {flashcards[currentIndex].back || flashcards[currentIndex].answer}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button onClick={markUnknown} className="px-6 py-3 rounded-xl bg-red-100 text-red-600 font-bold flex items-center gap-2 hover:bg-red-200 transition-colors">
                <X className="w-5 h-5" /> Unknown
              </button>
              
              <button onClick={markKnown} className="px-6 py-3 rounded-xl bg-green-100 text-green-600 font-bold flex items-center gap-2 hover:bg-green-200 transition-colors">
                <Check className="w-5 h-5" /> Known
              </button>

              <button onClick={handleNext} disabled={currentIndex === flashcards.length - 1} className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
