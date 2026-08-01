/**
 * api.js — Central Axios API Client
 * All HTTP requests to the FastAPI backend go through this instance.
 * Automatically attaches JWT Bearer token from localStorage.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // 90s — AI generation can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor — attach JWT token to every request
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pdf_intel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response Interceptor — handle 401 (token expired / invalid)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pdf_intel_token');
      localStorage.removeItem('pdf_intel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------------------------------------------------------------------------
// Named API helpers for clean imports across the app
// ---------------------------------------------------------------------------

/** AUTH */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

/** DOCUMENTS */
export const documentsAPI = {
  list: () => api.get('/documents/'),
  get: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

/** PDF UPLOAD */
export const uploadAPI = {
  uploadPdf: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-pdf/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
};

/** CHAT (RAG Pipeline) */
export const chatAPI = {
  sendMessage: (question, documentId = null) =>
    api.post('/chat/', { question, document_id: documentId }),
};

/** SEARCH */
export const searchAPI = {
  semanticSearch: (query, topK = 5) =>
    api.get('/search/', { params: { query, top_k: topK } }),
};

/** AI GENERATION — All new AI feature endpoints */
export const aiAPI = {
  summary: (documentId) =>
    api.post('/ai/summary', { document_id: documentId }),

  flashcards: (documentId, numItems = 10) =>
    api.post('/ai/flashcards', { document_id: documentId, num_items: numItems }),

  quiz: (documentId, numItems = 10) =>
    api.post('/ai/quiz', { document_id: documentId, num_items: numItems }),

  revisionNotes: (documentId) =>
    api.post('/ai/revision-notes', { document_id: documentId }),

  glossary: (documentId) =>
    api.post('/ai/glossary', { document_id: documentId }),

  insights: (documentId) =>
    api.post('/ai/insights', { document_id: documentId }),

  compare: (docId1, docId2) =>
    api.post(`/ai/compare?document_id_1=${docId1}&document_id_2=${docId2}`),
};

/** HEALTH */
export const healthAPI = {
  check: () => api.get('/health'),
};
