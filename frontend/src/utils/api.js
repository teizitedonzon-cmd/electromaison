import axios from 'axios';

const normalizeApiUrl = (url) => {
  const rawUrl = (url || '/api').trim().replace(/\/+$/, '');
  if (rawUrl === '/api') return rawUrl;
  return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
};

const getApiBaseUrl = () => {
  const configuredUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isVercelApp = hostname === 'electromaison.vercel.app' || hostname.endsWith('.vercel.app');

  if (isVercelApp && configuredUrl.includes('onrender.com')) {
    return '/api';
  }

  return configuredUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
      const reqUrl = error.config?.url || '';
      const isLoginAttempt = reqUrl.includes('/auth/connexion') || reqUrl.includes('/auth/login');
      if (!isLoginAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/connexion') {
          window.location.href = '/connexion';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
