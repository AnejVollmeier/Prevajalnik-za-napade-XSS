import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (email, password) =>
    api.post('/auth/register', { email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Analysis endpoints
export const analysisAPI = {
  submit: (target, inputMode, code) =>
    api.post('/analyze', { target, inputMode, code }),
  submitProject: (target, projectName, files) =>
    api.post('/analyze/project', { target, projectName, files }),
  getList: () => api.get('/analyses'),
  getDetail: (id) => api.get(`/analyses/${id}`),
};

export default api;

