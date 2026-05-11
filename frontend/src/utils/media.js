const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

export const API_ORIGIN = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const mediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
