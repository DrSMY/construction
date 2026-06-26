# Deploying & sharing Site Punch List

The app is **plain static files** (no build step), so any static host works.

## ⚠️ Read this first: hosting ≠ sharing data

There are two separate things:

1. **Hosting** — putting the app at a public URL so people can open it.
2. **Shared data** — everyone seeing the *same* projects, items, and approvals.

If you host the app while it's in **Local mode**, every visitor gets their **own empty copy** (data lives in *their* browser). That is *not* shared.

➡️ **To truly share it, you must connect Supabase (Cloud mode) before deploying.** Then one database backs every visitor.

---

## Recommended order for a shared, hosted app

### 1) Set up the cloud backend (once)
- Create a free project at **supabase.com**.
- **SQL Editor → New query →** paste all of `supabase-schema.sql` → **Run**.
- **Project Settings → API →** copy the **Project URL** and **anon/public key**.

### 2) Bake the keys into the app (so it's Cloud mode for *everyone*)
Edit **`config.js`** and fill in:
```js
window.PUNCHLIST_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "eyJ...your anon key...",
  SUPER_ADMIN_EMAIL: "drsamimoha2018@gmail.com"
};
```
> The anon key is **public by design** — it's safe to ship. Your data is protected by the database's row-level security, not by hiding the key. (The in-app "Connect cloud" panel only saves to the current browser, so it's for personal testing — for a shared site, put the keys in `config.js`.)

### 3) Deploy — pick one

**A. Netlify Drop (easiest, no CLI):**
Go to **app.netlify.com/drop** and drag the **`contractor-tracker`** folder onto the page. You get a live URL instantly. (Free Netlify account to keep it.)

**B. Vercel (CLI):**
```bash
cd "contractor-tracker"
npx vercel          # first run: log in + accept defaults
npx vercel --prod   # promote to your public URL
```

**C. Vercel/Netlify via GitHub (best for ongoing updates):**
```bash
cd "contractor-tracker"
git init && git add -A && git commit -m "Site Punch List"
# create an empty GitHub repo, then:
git remote add origin https://github.com/<you>/site-punch-list.git
git push -u origin main
```
Then in Vercel/Netlify → **Import Git Repository** → select it → deploy. (No framework/build — it's static; if asked for an output dir, leave blank / "root".)

### 4) Share the URL
Send the link to your owners/consultants/contractors. They sign up, owners create projects and share **join codes**, you approve people. Done.

---

## How do I log in as Super Admin?

Super Admin = the email in `config.js` / `super_email()` → **drsamimoha2018@gmail.com**.

- **Cloud mode (your shared site):** on first use, click **Create account**, enter that email + your password → the database makes you Super Admin automatically. After that, just **Sign in** with the same email + password.
- **Local mode (no cloud connected):** just **Sign in** with that email + any password — the account is created as Super Admin on first sign-in.

Either way, once in you'll see the **Super Admin** badge, the project switcher (all projects), and **⋮ → Admin panel** to approve/reject anyone.

> Changing the super-admin email later? Update it in **both** `config.js` and the `super_email()` function in `supabase-schema.sql`.
