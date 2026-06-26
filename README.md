# Site Punch List

A construction **snagging / punch-list tracker** for documenting unfinished or defective contractor work, tracking status, attaching photos, and exporting a PDF report to escalate. Built as a single-page app (vanilla JS, no build step).

## Features
- Card & table views, search, filters, sort, color-coded **status** and **priority**
- Multi-photo/video upload with gallery lightbox; before/after evidence
- Activity log, **expected completion date**, project/document header
- One-click **PDF export** (project header + grouped before/after photos)
- **Accounts & roles:** Super Admin · Owner · Consultant · Contractor
- **Multiple projects** with join codes + an approval workflow (only see projects you're approved on)
- Light/dark mode, mobile responsive, JSON backup export/import
- Runs **offline (Local mode)** or **synced (Cloud mode via Supabase)**

## Run locally
It's static — open `index.html`, or serve the folder:
```bash
python3 -m http.server 4601   # then visit http://localhost:4601
```

## Share it / deploy
See **[DEPLOY.md](DEPLOY.md)**. Short version: connect Supabase (so data is shared), put the keys in `config.js`, then deploy this folder to Vercel or Netlify.

## Cloud + roles setup
See **[README-cloud-setup.md](README-cloud-setup.md)** and run **[supabase-schema.sql](supabase-schema.sql)** once in your Supabase project.

## Files
| File | What |
|------|------|
| `index.html` / `style.css` / `app.js` | the app (UI + logic) |
| `backend.js` | auth + data layer (Local IndexedDB **or** Supabase) |
| `config.js` | Supabase keys + super-admin email |
| `supabase-schema.sql` | cloud database schema, security & functions |
