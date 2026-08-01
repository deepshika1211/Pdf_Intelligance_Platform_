import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import api from '../utils/api';

const Quiz = () => {
  const { pdfs } = usePDF();
  const [selectedPdf, setSelectedPdf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuiz = async () => {
    if (!selectedPdf) return;
    setLoading(true);
    setError('');
    setQuiz([]);
    try {
      const res = await api.post('/ai/quiz', { document_id: selectedPdf, num_items: 10 });
      setQuiz(res.data?.questions || []);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (err) {
      setError('Failed to generate quiz.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionStr) => {
    if (isAnswered) return;
    setSelectedOption(optionStr);
    setIsAnswered(true);
    
    const correctKey = quiz[currentIndex].correct || quiz[currentIndex].correctAnswer || quiz[currentIndex].answer || '';
    const isCorrect = optionStr.trim().startsWith(correctKey) || optionStr === correctKey;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restart = () => {
    setQuiz([]);
    setSelectedPdf('');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text" style={{ background: 'linear-gradient(135deg, #0284c7, #C1EBE9)', WebkitBackgroundClip: 'text' }}>
            Interactive Quiz
          </h1>
          <p className="mt-2 text-gray-600">Test your knowledge dynamically</p>
        </header>

        {!quiz.length && !showResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
            <select 
              value={selectedPdf}
              onChange={(e) => setSelectedPdf(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0284c7] outline-none"
            >
              <option value="">Select a document...</option>
              {pdfs.map(p => (
                <option key={p.id} value={p.dbId}>{p.name || p.title || 'Document ' + p.id}</option>
              ))}
            </select>
            <button 
              onClick={generateQuiz}
              disabled={!selectedPdf || loading}
              style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }}
              className="px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Quiz'}
            </button>
          </motion.div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">{error}</div>}

        {quiz.length > 0 && !showResult && (
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-400">Question {currentIndex + 1} of {quiz.length}</span>
              <span className="text-sm font-bold text-[#0284c7]">Score: {score}</span>
            </div>
            
            <div className="h-2 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-[#0284c7] transition-all" style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }} />
            </div>

            <h2 className="text-2xl font-bold mb-8 text-gray-800">{quiz[currentIndex].question}</h2>
            <div className="space-y-4">
              {quiz[currentIndex].options?.map((opt, i) => {
                const correctKey = quiz[currentIndex].correct || quiz[currentIndex].correctAnswer || quiz[currentIndex].answer || '';
                const isCorrectAns = opt.trim().startsWith(correctKey) || opt === correctKey;
                const isSelected = selectedOption === opt;
                
                let btnStyle = "bg-gray-50 border-gray-200 hover:border-[#0284c7] hover:bg-blue-50 text-gray-700";
                
                if (isAnswered) {
                  if (isCorrectAns) {
                    btnStyle = "bg-green-50 border-green-500 text-green-700";
                  } else if (isSelected && !isCorrectAns) {
                    btnStyle = "bg-red-50 border-red-500 text-red-700";
                  } else {
                    btnStyle = "bg-gray-50 border-gray-200 opacity-50";
                  }
                }

                return (
                  <button 
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between font-medium ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrectAns && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {isAnswered && isSelected && !isCorrectAns && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }}
                  className="px-8 py-3 rounded-xl text-white font-bold hover:shadow-lg transition-all"
                >
                  {currentIndex < quiz.length - 1 ? 'Next Question' : 'View Results'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {showResult && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-3xl shadow-xl text-center border border-gray-100">
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <div className="text-7xl font-extrabold mb-4" style={{ color: '#0284c7' }}>
              {Math.round((score / quiz.length) * 100)}%
            </div>
            <p className="text-gray-500 text-lg mb-8">You scored {score} out of {quiz.length}</p>
            <button 
              onClick={restart}
              style={{ background: 'linear-gradient(135deg, #FF4400, #F4AE52)' }}
              className="px-8 py-4 rounded-xl text-white font-bold text-lg hover:shadow-lg transition-all"
            >
              Take Another Quiz
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
