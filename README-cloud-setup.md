# Site Punch List — Cloud setup & roles

The app runs in **two modes**:

| Mode | When | Accounts & data |
|------|------|-----------------|
| **Local** (default) | no cloud connected | stored in this browser only |
| **Cloud** | you connect Supabase | real accounts + projects, synced across devices |

You can switch to cloud **from inside the app** — no file editing needed.

## Connect cloud (≈5 min, free)

1. Create a project at **[supabase.com](https://supabase.com)** → *New project*. Wait for it to finish.
2. Open **SQL Editor → New query**, paste all of [`supabase-schema.sql`](supabase-schema.sql), **Run**. (Creates tables, roles, security, and the approval functions.)
3. In Supabase: **Project Settings → API** → copy the **Project URL** and the **anon / public** key.
4. In the app's **Sign-in screen**, click **“Connect cloud (Supabase)”**, paste both values, and hit **Test & connect**. The app reloads in cloud mode (a **Cloud** badge appears).
   - *(Optional, simpler first run:* Authentication → Providers → Email → turn **Confirm email** off while testing.)*
5. Sign up / sign in. Done.

> The same values can instead be put in [`config.js`](config.js) if you prefer.

## Super Admin

Whoever signs in with the email set in `super_email()` (in `supabase-schema.sql`) **and** `SUPER_ADMIN_EMAIL` (in `config.js`) becomes the **Super Admin** — currently **drsamimoha2018@gmail.com**.

- In **local mode**, just sign in with that email + any password the first time; the account is created as Super Admin.
- In **cloud mode**, sign up with that email; the database makes it Super Admin automatically.
- Super Admin sees **all projects**, all users, and can **approve/reject** any join request from the **Admin panel** (⋮ menu).

To change the super-admin email, edit it in **both** `config.js` and the `super_email()` function in `supabase-schema.sql`.

## Roles & projects

- **Owner** — creates a project (gets a 6-char **join code**), manages its punch list, edits the project header, and **approves/rejects** members (⋮ → *Members & approvals*).
- **Consultant** — manages the punch list (add/edit items, status, comments, photos) but can't manage members or the project header.
- **Contractor** — responds only: add comments, set the **expected completion date**, and upload **after/progress** photos.

**How people join:** the Owner shares the project's **join code**. A Consultant/Contractor signs up, enters that code, and lands in a **“waiting for approval”** screen until the Owner or Super Admin approves them. Everyone only sees the projects they're approved on.

| Action | Super Admin | Owner | Consultant | Contractor |
|--------|:----:|:----:|:----:|:----:|
| All projects / approve anyone | ✅ | — | — | — |
| Add / edit / delete items, status | ✅ | ✅ | ✅ | — |
| Edit project header | ✅ | ✅ | — | — |
| Approve/reject members | ✅ | ✅ | — | — |
| Comment · expected date · after-photos | ✅ | ✅ | ✅ | ✅ |
| View & export PDF | ✅ | ✅ | ✅ | ✅ |

In **cloud mode** these limits are enforced by the database (Row-Level Security + `SECURITY DEFINER` functions) — not just the UI.

## Notes
- Photos are stored inline (base64) for simplicity; switch to Supabase **Storage** later for large volumes.
- Backups (⋮ → Export/Import) work in both modes and import into the **current** project.
