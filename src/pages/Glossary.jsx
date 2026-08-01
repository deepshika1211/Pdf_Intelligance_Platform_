import React, { useState, useMemo } from 'react';
import { Loader2, Search } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

const Glossary = () => {
  const { pdfs } = usePDF();
  const [selectedPdf, setSelectedPdf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [glossary, setGlossary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const generateGlossary = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setError('');
    setGlossary([]);
    try {
      const res = await api.post('/ai/glossary', { document_id: selectedPdf });
      let data = res.data?.glossary || res.data || [];
      // Sort alphabetically by term
      data = data.sort((a, b) => a.term.localeCompare(b.term));
      setGlossary(data);
    } catch (err) {
      setError('Failed to generate glossary.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGlossary = useMemo(() => {
    return glossary.filter(item => 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [glossary, searchTerm]);

  const scrollToLetter = (letter) => {
    const el = document.getElementById(`letter-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getBadgeColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'technical': return 'bg-blue-100 text-blue-700';
      case 'acronym': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text' }}>
            AI Glossary
          </h1>
          <p className="mt-2 text-gray-600">Discover and search key terms extracted from your documents</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <select 
            value={selectedPdf}
            onChange={(e) => setSelectedPdf(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Select a document...</option>
            {pdfs.map(p => (
              <option key={p.id} value={p.dbId}>{p.name || p.title || 'Document ' + p.id}</option>
            ))}
          </select>
          <button 
            onClick={generateGlossary}
            disabled={!selectedPdf || loading}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Glossary'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">{error}</div>}

        {glossary.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search terms..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="text-gray-500 font-medium">
                Showing {filteredGlossary.length} terms
              </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center py-4 px-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              {alphabet.map(letter => (
                <button 
                  key={letter} 
                  onClick={() => scrollToLetter(letter)}
                  className="w-8 h-8 rounded-lg text-sm font-semibold hover:bg-emerald-100 hover:text-emerald-700 transition-colors text-gray-500"
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGlossary.map((item, idx) => {
                const firstLetter = item.term.charAt(0).toUpperCase();
                const isFirstOfLetter = idx === 0 || filteredGlossary[idx-1].term.charAt(0).toUpperCase() !== firstLetter;

                return (
                  <React.Fragment key={idx}>
                    {isFirstOfLetter && <div id={`letter-${firstLetter}`} className="col-span-full mt-4 mb-2 text-2xl font-black text-emerald-800 border-b-2 border-emerald-100 pb-2">{firstLetter}</div>}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{item.term}</h3>
                        {item.category && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${getBadgeColor(item.category)}`}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm flex-1">{item.definition}</p>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Glossary;
