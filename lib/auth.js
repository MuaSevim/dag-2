import crypto from 'node:crypto';

const NAME = 'dd_session';
const TTL = 60 * 60 * 12; // 12 hours
const secret = () => process.env.SESSION_SECRET || '';
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('base64url');
const hash = (s) => crypto.createHash('sha256').update(String(s ?? '')).digest();

export const safeEq = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));

export function makeCookie() {
  const v = `admin.${Math.floor(Date.now() / 1000) + TTL}`;
  return `${NAME}=${v}.${sign(v)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TTL}`;
}

export const clearCookie = () => `${NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;

export function isAuthed(req) {
  const m = (req.headers.cookie || '').match(new RegExp(`${NAME}=([^;]+)`));
  if (!m || !secret()) return false;
  const [u, exp, sig] = m[1].split('.');
  const a = Buffer.from(sig || ''), b = Buffer.from(sign(`${u}.${exp}`));
  return u === 'admin' && a.length === b.length && crypto.timingSafeEqual(a, b) && Number(exp) > Date.now() / 1000;
}
