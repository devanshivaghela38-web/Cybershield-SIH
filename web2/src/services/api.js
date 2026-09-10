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
export async function anchorDocument(file) {
  const form = new FormData();
  form.append('document', file);

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
