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

const apiBaseUrl = getApiBaseUrl();

export const API_ORIGIN = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const mediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
