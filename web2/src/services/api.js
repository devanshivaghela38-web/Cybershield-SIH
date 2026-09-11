/**
 * api.js — Service layer
 *
 * All HTTP calls from the React frontend go through here.
 * Uses the Vite dev proxy (/api → localhost:4000) so no CORS issues.
 */

const BASE_URL = '';  // Empty = relative URLs (proxied by Vite in dev, same-origin in prod)

/**
 * Uploads a file to the backend and receives its SHA-256 hash.
 * @param {File} file
 * @returns {Promise<{ hash: string, filename: string, fileSizeBytes: number, algorithm: string }>}
 */
export async function hashFile(file) {
  const form = new FormData();
  form.append('document', file);

  const res = await fetch(`${BASE_URL}/api/hash`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Hash request failed (${res.status})`);
  }

  return res.json();
}

/**
 * Uploads a file to the backend, which:
 *  1. Hashes it (SHA-256)
 *  2. Pins it to IPFS (Pinata)
 *  3. Anchors the hash on Polygon
 *
 * @param {File} file
 * @returns {Promise<{
 *   hash: string,
 *   filename: string,
 *   ipfsCid: string | null,
 *   ipfsUrl: string | null,
 *   txHash: string,
 *   explorerUrl: string,
 *   blockNumber: number,
 * }>}
 */
export async function anchorDocument(file, parentHash = "", validUntil = 0) {
  const form = new FormData();
  form.append('document', file);
  if (parentHash) form.append('parentHash', parentHash);
  if (validUntil) form.append('validUntil', validUntil);

  const res = await fetch(`${BASE_URL}/api/anchor`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Anchoring failed (${res.status})`);
  }

  return res.json();
}

/**
 * Downloads a sealed PDF (with stamped QR Code)
 * @param {File} file 
 * @param {string} hash 
 */
export async function downloadSealedPdf(file, hash) {
  const form = new FormData();
  form.append('document', file);
  form.append('hash', hash);

  const res = await fetch(`${BASE_URL}/api/stamp-qr`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`QR Stamping failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sealed_${file.name}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Revokes a document
 * @param {string} hash 
 * @param {string} reason 
 */
export async function revokeDocumentOnChain(hash, reason) {
  const res = await fetch(`${BASE_URL}/api/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash, reason }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Revocation failed');
  }

  return res.json();
}

/**
 * Compares tampered document against original IPFS version
 * @param {File} file 
 * @param {string} originalIpfsUrl 
 */
export async function compareDocuments(file, originalIpfsUrl) {
  const form = new FormData();
  form.append('document', file);
  form.append('originalIpfsUrl', originalIpfsUrl);

  const res = await fetch(`${BASE_URL}/api/diff`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate diff');
  }

  return res.json();
}

/**
 * Uploads a file to the backend, which:
 *  1. Hashes it (SHA-256)
 *  2. Queries Polygon to check if the hash has been anchored
 *
 * @param {File} file
 * @returns {Promise<{
 *   hash: string,
 *   filename: string,
 *   exists: boolean,
 *   verified: boolean,
 *   timestamp: string | null,
 *   anchoredBy: string | null,
 *   anchoredDate: string | null,
 * }>}
 */
export async function verifyDocument(file) {
  const form = new FormData();
  form.append('document', file);

  const res = await fetch(`${BASE_URL}/api/verify`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Verification failed (${res.status})`);
  }

  return res.json();
}

/**
 * Pings the backend health endpoint.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Authenticates user or admin
 */
export async function loginUser(username, password, role = 'user') {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  return res.json();
}

/**
 * Registers a new user or admin account
 */
export async function signupUser({ name, username, email, password, role = 'user' }) {
  const res = await fetch(`${BASE_URL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Sign up failed');
  }

  return res.json();
}

/**
 * Fetches metrics for Admin Dashboard
 */
export async function fetchAdminMetrics() {
  const res = await fetch(`${BASE_URL}/api/admin/metrics`);
  if (!res.ok) throw new Error('Failed to fetch admin metrics');
  return res.json();
}

/**
 * Fetches all document records for Admin Dashboard
 */
export async function fetchAdminDocuments() {
  const res = await fetch(`${BASE_URL}/api/admin/documents`);
  if (!res.ok) throw new Error('Failed to fetch admin documents');
  return res.json();
}

/**
 * Revokes/removes a document entry in Admin mode
 */
export async function deleteAdminDocument(hash) {
  const res = await fetch(`${BASE_URL}/api/admin/documents/${hash}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete document entry');
  return res.json();
}

