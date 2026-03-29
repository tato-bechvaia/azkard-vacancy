/**
 * PUBLIC_BASE_URL — public origin for this API (e.g. https://api.example.com).
 * When unset, defaults to http://localhost:${PORT} for local dev.
 */
function defaultBase() {
  return process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
}

function toPublicUrl(pathOrUrl) {
  if (pathOrUrl == null || typeof pathOrUrl !== 'string') return pathOrUrl;
  const s = pathOrUrl.trim();
  if (!s) return pathOrUrl;
  if (/^https?:\/\//i.test(s)) return s;
  const baseNorm = defaultBase().replace(/\/$/, '');
  const pathNorm = s.startsWith('/') ? s : `/${s}`;
  return baseNorm + pathNorm;
}

const ASSET_KEYS = new Set(['avatarUrl', 'logoUrl', 'cvUrl']);

function expandAssetUrlsInJson(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(expandAssetUrlsInJson);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (ASSET_KEYS.has(k) && typeof v === 'string') {
        out[k] = toPublicUrl(v);
      } else if (v !== null && typeof v === 'object') {
        out[k] = expandAssetUrlsInJson(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return value;
}

module.exports = { toPublicUrl, expandAssetUrlsInJson, defaultBase };
