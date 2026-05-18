import axios from 'axios';

const normalizeApiUrl = (url) => {
  const rawUrl = (url || '/api').trim().replace(/\/+$/, '');
  if (rawUrl === '/api') return rawUrl;
  return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
};

const api = axios.create({
  baseURL: normalizeApiUrl(process.env.REACT_APP_API_URL),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Suppression du Content-Type fixe ici pour laisser Axios décider
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers?.['x-refresh-token'];
    if (refreshedToken) {
      localStorage.setItem('token', refreshedToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default api;
