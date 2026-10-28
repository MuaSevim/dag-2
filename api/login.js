import { makeCookie, safeEq } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user, password } = req.body || {};
  const { ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET } = process.env;
  if (!ADMIN_USER || !ADMIN_PASSWORD || !SESSION_SECRET) {
    return res.status(500).json({ error: 'Sunucu ayarları eksik (ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET).' });
  }
  const ok = safeEq(user, ADMIN_USER) && safeEq(password, ADMIN_PASSWORD);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 900)); // slows down brute force
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }
  res.setHeader('Set-Cookie', makeCookie());
  res.json({ ok: true });
}
