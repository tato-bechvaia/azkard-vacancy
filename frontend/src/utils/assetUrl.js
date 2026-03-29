/** Backend origin (no trailing slash). Set VITE_API_URL to match production API, e.g. https://api.example.com */
export const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/** Use for uploads returned as relative paths, or absolute URLs from the API (pass-through). */
export function assetUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return pathOrUrl;
  const s = String(pathOrUrl).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const p = s.startsWith('/') ? s : `/${s}`;
  return `${API_ORIGIN}${p}`;
}
