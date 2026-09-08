# GadGexo

India-focused gadget discovery, comparison, and price-tracking
platform. **DISCOVER • EXPLORE • UPGRADE**

> **Current phase: 1 — Project Foundation.** See `PHASES.md` for the
> full 13-phase roadmap. This is a clean rebuild — an earlier
> Termux-based attempt exists only as a private backup and is not part
> of this codebase.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, backed by Supabase
(database, auth, storage), version-controlled on GitHub, deployed on
Vercel.

## Workflow — 100% browser-based, no terminal

This project is built and maintained without Termux, Acode, or any
local command-line workflow. The intended loop is:

1. Code is generated (by Claude) as ready-to-upload files.
2. Files are uploaded to **GitHub** using the website's drag-and-drop
   uploader — no `git` commands needed.
3. **Vercel** is connected to the GitHub repo once; after that, every
   change pushed to GitHub triggers an automatic deployment.
4. The owner reviews the live Vercel preview/production URL.

### Uploading this project to GitHub (first time)

1. Create a new repository at github.com (no README/license needed —
   this project already has one).
2. On the repo page, click **"uploading an existing file"** (shown on
   an empty repo) or use **Add file → Upload files**.
3. Drag the *contents* of this project folder in (not the folder
   itself — GitHub needs the files at the repo root).
4. Commit directly to the `main` branch.

### Connecting Vercel

1. Go to vercel.com → **Add New → Project → Import Git Repository**.
2. Select this GitHub repo.
3. Before the first deploy, add the environment variables listed below
   under **Environment Variables**.
4. Deploy. Every future push to `main` redeploys automatically.

## Environment variables

Copy `.env.example` as a reference for what to add in Vercel's
**Project Settings → Environment Variables** (there's no `.env.local`
step needed if you're never running this locally).

| Variable                          | Exposed to browser? | Used by                              |
| ---------------------------------- | -------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`             | Yes                  | Metadata, sitemap, OG tags             |
| `NEXT_PUBLIC_SUPABASE_URL`         | Yes                  | `lib/supabase/client.ts` & `server.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Yes                  | `lib/supabase/client.ts` & `server.ts` |
| `SUPABASE_SERVICE_ROLE_KEY`        | **No — server only** | `lib/supabase/admin.ts` (not called yet in Phase 1) |

`lib/supabase/admin.ts` imports the `server-only` package specifically
so an accidental client-side import fails the **build**, not just
fails silently at runtime.

## Project structure

```
app/                    Routes (App Router). Only a placeholder
                         homepage + error/loading/not-found exist so
                         far — Phase 4 builds the real homepage.
  api/health/            Deployment health check (no secrets exposed)
  globals.css            Design tokens (dark default, light available)

components/
  brand/logo-mark.tsx    Text placeholder until the real logo asset exists
  ui/                    Empty — Phase 3 (buttons, cards, tables, ...)

lib/
  supabase/              client.ts (browser), server.ts (SSR),
                         admin.ts (service role — server-only, unused so far)
  config/site.ts         Single source of truth for name/tagline/URL
  validation/            Empty — Phase 2+ (needs a real schema first)
  utils/cn.ts            Small className helper

types/database.ts        Empty placeholder — Phase 2 generates the real one

automation/               Reserved, empty — see automation/README.md
                         for what Phase 11 will need and why this
                         Phase-1 foundation doesn't block it.

middleware.ts             Refreshes the Supabase session cookie; future
                         home for server-side route gating (Phase 9/10)
```

## Security notes

- The Supabase **anon key** is public by design — Row Level Security
  (built in Phase 2) is the real access control, not key secrecy.
- The **service role key** bypasses RLS entirely. It's never referenced
  from client code, never prefixed `NEXT_PUBLIC_`, and Phase 1 doesn't
  even call `createAdminClient()` anywhere yet — the pattern exists so
  later phases have one correct place to use it instead of each
  inventing their own.
- No secrets are committed to this repository. `.gitignore` excludes
  `.env*` files; Vercel's environment variable settings are the only
  place real values should ever live.

## What Phase 1 deliberately does NOT include

Per the phased roadmap, none of the following exist yet: the product
database, smartphone catalogue, comparison tool, pricing system,
authentication UI, admin panel, or the automation agent. Building
those now would mean guessing at requirements Phase 2–11 haven't
defined yet — see `PHASES.md`.
