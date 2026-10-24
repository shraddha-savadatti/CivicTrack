const BASE = import.meta.env.VITE_API_URL || '';
export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { 'X-Requested-With': 'civictrack' }; let payload;
  if (form) payload = form; else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  let res;
  try { res = await fetch(`${BASE}/api${path}`, { method, headers, body: payload, credentials: 'include' }); }
  catch { throw new Error('Cannot reach the server. Nothing was saved.'); } // never fake success
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || `Request failed (${res.status})`); e.status = res.status; e.details = data.details; throw e; }
  return data;
}
export const imageUrl = n => n ? `${BASE}/uploads/${n}` : null;
