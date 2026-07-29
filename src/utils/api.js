/**
 * api.js — Central Axios API Client
 * All HTTP requests to the FastAPI backend go through this instance.
 * Automatically attaches JWT Bearer token from localStorage.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — PDF processing can take time
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
      // Clear stale token and redirect to login
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

/** HEALTH */
export const healthAPI = {
  check: () => api.get('/health'),
};
