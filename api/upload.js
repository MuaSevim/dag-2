import { put } from '@vercel/blob';
import { isAuthed } from '../lib/auth.js';

export const config = { api: { bodyParser: false } };

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 4 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAuthed(req)) return res.status(401).json({ error: 'Giriş gerekli.' });
  const type = (req.headers['content-type'] || '').split(';')[0];
  const ext = TYPES[type];
  if (!ext) return res.status(400).json({ error: 'Sadece JPG, PNG veya WebP yüklenebilir.' });
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX) return res.status(413).json({ error: 'Görsel çok büyük (en fazla 4 MB).' });
    chunks.push(c);
  }
  try {
    const blob = await put(`img/item.${ext}`, Buffer.concat(chunks), { access: 'public', addRandomSuffix: true, contentType: type });
    res.json({ url: blob.url });
  } catch (e) {
    res.status(500).json({ error: 'Yüklenemedi. Blob deposu bağlı mı? ' + e.message });
  }
}
