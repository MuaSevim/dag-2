import { readMenu, writeMenu } from '../lib/store.js';
import { isAuthed } from '../lib/auth.js';

const str = (v, n) => String(v ?? '').slice(0, n);
const okUrl = (u) => (/^(https:\/\/|\/)/.test(u || '') ? str(u, 600) : '');

const item = (i) => ({
  id: str(i.id, 40), name: str(i.name, 120), desc: str(i.desc, 300),
  price: Math.max(0, Number(i.price) || 0), star: !!i.star, img: okUrl(i.img),
});

function clean(m) {
  return {
    posters: (m.posters || []).slice(0, 12).map(item),
    categories: m.categories.slice(0, 40).map((c) => ({
      id: str(c.id, 40), title: str(c.title, 80), short: str(c.short, 40), icon: str(c.icon, 8),
      note: str(c.note, 300), photos: !!c.photos, items: c.items.slice(0, 200).map(item),
    })),
  };
}

const valid = (m) =>
  m && Array.isArray(m.categories) &&
  m.categories.every((c) => typeof c.title === 'string' && Array.isArray(c.items) && c.items.every((i) => typeof i.name === 'string'));

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60');
    return res.json(await readMenu());
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'Giriş gerekli.' });
  if (req.method === 'PUT') {
    if (!valid(req.body)) return res.status(400).json({ error: 'Geçersiz menü verisi.' });
    try {
      await writeMenu(clean(req.body));
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Kaydedilemedi. Blob deposu bağlı mı? ' + e.message });
    }
  }
  res.status(405).end();
}
