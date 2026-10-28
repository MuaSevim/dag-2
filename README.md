# Dağ Döner – Web Menu + Admin Panel

- `/`       public menu (also prints cleanly on A4 – use the "Yazdır" button)
- `/admin`  login + dashboard: edit item names, descriptions, prices, favorites, photos, order, posters

No database server needed: the menu is stored as one JSON file in **Vercel Blob**, photos are uploaded to Blob too.

## Deploy on Vercel

1. Push this folder to a GitHub repo (or run `npx vercel` inside it).
2. Import the repo in Vercel (Framework preset: **Other**, no build command).
3. Project → **Storage** → **Create** → **Blob** → choose a **Public** store → connect it to this project.
   This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. Project → **Settings → Environment Variables**, add:
   - `ADMIN_USER`      e.g. `admin`
   - `ADMIN_PASSWORD`  a long, unique password
   - `SESSION_SECRET`  random string: run `openssl rand -hex 32`
5. **Redeploy** (Deployments → ⋯ → Redeploy). Open `https://your-domain/admin`.

Until the first "Kaydet" the site shows the built-in menu from `data/seed.js`.

## How it works
- Login: one admin account from env vars (no registration). Session = signed, HttpOnly cookie, 12 h.
- Photos are resized in the browser (max 1200 px, WebP) before upload, so they stay light.
- Saved changes appear on the public menu within ~20–60 seconds (CDN cache).
- Printing: the page has an A4 print layout. Enable "background graphics" in the print dialog.

## Local development
```
npm i -g vercel
npm i
vercel link && vercel env pull .env.local
vercel dev
```
(Without a Blob token the public menu still works from the seed; saving/uploading needs the token.)

## Change the password
Change `ADMIN_PASSWORD` in Vercel env vars and redeploy. Changing `SESSION_SECRET` logs everyone out.
