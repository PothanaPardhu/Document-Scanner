const API_URL = import.meta.env.VITE_API_URL || 'https://document-scanner-ehsf.onrender.com';

export default API_URL;

export function apiFetch(path, options) {
  return fetch(`${API_URL}${path}`, options);
}
