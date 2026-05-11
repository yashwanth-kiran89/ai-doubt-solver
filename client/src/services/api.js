import axios from 'axios';

// Use environment variable - THIS IS THE KEY CHANGE
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally - auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  // Use your Render backend URL
  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://ai-doubt-solver-277b.onrender.com';
  return `${BACKEND_URL}${imagePath}`;
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}; 

export const chatAPI = {
  getAll: () => api.get('/chats'),
  getById: (id) => api.get(`/chats/${id}`),
  create: (data = {}) => api.post('/chats', data),
  delete: (id) => api.delete(`/chats/${id}`),
  getStats: () => api.get('/chats/stats'),

  askText: (chatId, question, subject) =>
    api.post(`/chats/${chatId}/text`, { question, subject }),

  askImage: (chatId, imageFile, question, subject) => {
    const form = new FormData();
    form.append('image', imageFile);
    if (question) form.append('question', question);
    if (subject) form.append('subject', subject);
    return api.post(`/chats/${chatId}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    });
  },

  askVoice: (chatId, audioBlob, subject) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'voice_recording.webm');
    if (subject) form.append('subject', subject);
    return api.post(`/chats/${chatId}/voice`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    });
  },
};

export const doubtAPI = {
  ask: (data) => api.post('/doubts/ask', data),
  askWithImage: (formData) => api.post('/doubts/ask-with-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  }),
  getHistory: (params) => api.get('/doubts/history', { params }),
  getById: (id) => api.get(`/doubts/${id}`),
  markHelpful: (id, isHelpful) => api.patch(`/doubts/${id}/helpful`, { isHelpful }),
  delete: (id) => api.delete(`/doubts/${id}`),
  followUp: (id, question) => api.post(`/doubts/${id}/followup`, { question }),
};

export default api;