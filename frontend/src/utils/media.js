const normalizeApiUrl = (url) => {
  const rawUrl = (url || '/api').trim().replace(/\/+$/, '');
  if (rawUrl === '/api') return rawUrl;
  return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
};

const apiBaseUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);

export const API_ORIGIN = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const mediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
