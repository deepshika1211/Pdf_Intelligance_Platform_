import React, { useState } from 'react';
import { Loader2, Copy, Download } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

const RevisionNotes = () => {
  const { pdfs } = usePDF();
  const [selectedPdf, setSelectedPdf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  const generateNotes = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setError('');
    setNotes('');
    try {
      const res = await api.post('/ai/revision-notes', { document_id: selectedPdf });
      setNotes(res.data?.notes || res.data || '');
    } catch (err) {
      setError('Failed to generate revision notes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes);
    alert('Copied to clipboard!');
  };

  const downloadTxt = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Revision_Notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple markdown renderer function
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3 text-purple-900 border-b pb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-extrabold mt-8 mb-4 text-purple-950">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-6 mb-2 list-disc text-gray-700">{formatText(line.replace('- ', ''))}</li>;
      }
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      return <p key={idx} className="mb-3 text-gray-700 leading-relaxed">{formatText(line)}</p>;
    });
  };

  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #7c3aed, #c084fc)', WebkitBackgroundClip: 'text' }}>
            Revision Notes
          </h1>
          <p className="mt-2 text-gray-600">Distill complex documents into elegant summaries</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <select 
            value={selectedPdf}
            onChange={(e) => setSelectedPdf(e.target.value)}
            className="w-full sm:w-2/3 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="">Select a document...</option>
            {pdfs.map(p => (
              <option key={p.id} value={p.dbId}>{p.name || p.title || 'Document ' + p.id}</option>
            ))}
          </select>
          <button 
            onClick={generateNotes}
            disabled={!selectedPdf || loading}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Notes'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">{error}</div>}

        {notes && !loading && (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 relative">
            <div className="absolute top-6 right-6 flex gap-3">
              <button onClick={copyToClipboard} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors border border-gray-200" title="Copy">
                <Copy className="w-5 h-5" />
              </button>
              <button onClick={downloadTxt} className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors border border-purple-200" title="Download">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-8 prose prose-purple max-w-none">
              {renderMarkdown(notes)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionNotes;
