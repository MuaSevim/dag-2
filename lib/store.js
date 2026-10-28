import { put, list } from '@vercel/blob';
import seed from '../data/seed.js';

const KEY = 'menu/menu.json';

// Reads the saved menu from Blob; falls back to the bundled seed menu.
export async function readMenu() {
  try {
    const { blobs } = await list({ prefix: KEY, limit: 1 });
    if (blobs[0]) {
      const r = await fetch(`${blobs[0].url}?t=${Date.now()}`);
      if (r.ok) return await r.json();
    }
  } catch (e) {
    console.error('readMenu fallback:', e.message);
  }
  return seed;
}

export const writeMenu = (menu) =>
  put(KEY, JSON.stringify(menu), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
