# Codex Task Brief — OneSIM Deployment Prep
## Read this fully before making any changes

---

## Context: What This Project Is

- **React SPA** (Create React App) — NOT Next.js
- **Frontend:** React 19 + Chakra UI + React Router DOM v6
- **API:** Vercel Serverless Functions in `/api/*.js` (stays on Vercel, you do NOT touch these files)
- **Database:** Supabase (external, you do NOT touch anything Supabase)
- **Local dev server:** `server.js` — Express proxy, used only for `npm run dev`

---

## Context: What Claude Code Already Did Before You

Claude Code has already created:
- `.github/workflows/deploy-staging.yml` — GitHub Actions for staging
- `.github/workflows/deploy-production.yml` — GitHub Actions for production
- `.env.staging.example` and `.env.production.example`

Your job is **code-level changes only**. Do not touch CI/CD workflow files.

---

## Context: Target Architecture

```
branch: staging → GitHub Actions → builds React → FTP → stg.onesim.uz (cPanel static)
                                                       → Vercel staging API handles /api/*

branch: main    → GitHub Actions → builds React → FTP → onesim.uz (cPanel static)
                                                       → Vercel prod API handles /api/*
```

The React frontend is served as **pure static files** on cPanel (Apache).
The API remains 100% on Vercel serverless functions.

---

## YOUR TASKS

---

### TASK 1 — Security: Remove Sensitive Data from Frontend Bundle

**Problem:**
`REACT_APP_*` variables get baked into the JavaScript bundle at build time.
Anyone can open browser DevTools → Sources and read them.

The following are currently exposed and must NOT be:
- `REACT_APP_PROFIT_MARGIN` — reveals our business margin (sensitive!)
- `REACT_APP_ESIMACCESS_API_URL` — reveals our eSIM provider (sensitive!)
- `REACT_APP_USD_TO_UZS_RATE` — mildly sensitive, reveals internal rate

**What to do:**

1. Search the entire `src/` directory for all usages of:
   - `process.env.REACT_APP_PROFIT_MARGIN`
   - `process.env.REACT_APP_ESIMACCESS_API_URL`
   - `process.env.REACT_APP_USD_TO_UZS_RATE`

2. For each usage found:
   - If it is used to **calculate final prices shown to user** → the calculation must move to the Vercel API side. The frontend should receive already-calculated final prices from the API, not raw costs + margin.
   - If it is used as a **direct API URL for backend calls** → it should not be in `REACT_APP_*`. API calls from the frontend should go to `/api/packages`, `/api/order` etc. (relative paths, handled by Vercel). The actual eSIMAccess URL should only live in Vercel env vars.

3. Remove the sensitive `REACT_APP_*` vars from `.env` and `.env.example`.

4. Verify the app still works after these changes. Run `npm run build` locally and check that the sensitive strings do not appear in the output JS files in `/build/static/js/`.

**Constraint:** Do NOT break the existing `/api/*.js` Vercel functions. They already have access to `ESIMACCESS_API_KEY` and `ESIMACCESS_SECRET_KEY` as server-side env vars.

---

### TASK 2 — Environment-Aware API Base URL

**Problem:**
The frontend currently uses `REACT_APP_PROXY_URL=http://localhost:5000/api` for local dev.
In production (both staging and prod), the frontend should call `/api/...` relative paths — Vercel handles routing automatically.

**What to do:**

1. Find all places in `src/` where API calls are made (look for `REACT_APP_PROXY_URL`, `fetch(`, `axios(`, or any service files in `src/services/`).

2. Ensure that in production builds, all API calls go to `/api/...` (relative, no domain prefix). The browser will call `onesim.uz/api/packages` which Vercel intercepts.

3. The correct pattern:
   ```js
   const API_BASE = process.env.REACT_APP_API_BASE || '/api';
   // Usage:
   fetch(`${API_BASE}/packages`)
   ```
   - Local dev: `REACT_APP_API_BASE=http://localhost:5000/api` (set in `.env`)
   - Staging/Prod: `REACT_APP_API_BASE` is NOT set → defaults to `/api`

4. Update `.env.example` to show this variable with the local dev value.

5. Do NOT hardcode any domain names or Vercel URLs in the source code.

---

### TASK 3 — Apache `.htaccess` for SPA Routing

**Problem:**
React Router handles routing client-side. If a user navigates directly to `onesim.uz/mypage` or refreshes the page, Apache (cPanel) looks for a real file at that path, finds nothing, and returns 404.

**What to do:**

1. Create the file `public/.htaccess` with the following content:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

2. This file will be automatically copied to `/build/.htaccess` when `npm run build` runs (Create React App copies everything from `public/` to `build/`).

3. Verify the file is in `public/` (not `src/`, not root).

**Note:** Do NOT add any domain-specific redirect rules. Keep it generic.

---

### TASK 4 — Update `vercel.json` for CORS (Staging + Production)

**Problem:**
Currently `vercel.json` sets `Access-Control-Allow-Origin: *` which is too permissive for production.
We need to allow requests from both our domains.

**What to do:**

1. Open `vercel.json`.

2. Update the CORS `Access-Control-Allow-Origin` header value. Since Vercel doesn't support dynamic origin matching in `vercel.json` headers, use the following approach — keep `*` for now but add a comment block at the top of the file explaining this should be tightened once both domains are confirmed. This is a known limitation of Vercel's static header config.

3. In the `rewrites` section, ensure `/api/:path*` rewrite is still present.

4. In the `crons` section, ensure the price-sync cron (`0 2 * * *`) is still present.

5. Do NOT remove or break any existing config. Only add/adjust CORS if it improves things without breaking anything.

**Important:** The existing Vercel config must continue working for the current Vercel deployment. Do not make changes that would break the live API.

---

### TASK 5 — Review and Confirm `server.js` Local Dev Integrity

**Problem:**
`server.js` is the local development proxy. After the changes in Tasks 1-2, the local dev flow must still work.

**What to do:**

1. Read `server.js` fully.

2. Verify that all routes in `server.js` still match the API paths the frontend will call after Task 2 changes.

3. If the frontend now calls `/api/packages` (relative), and `server.js` handles `GET /api/packages`, confirm they align.

4. If `server.js` uses any env var that no longer exists (removed in Task 1), update it to use the correct server-side variable name (without `REACT_APP_` prefix).

5. Do NOT add any production logic to `server.js`. It is local dev only.

---

## CONSTRAINTS & RULES

- **Do NOT touch:** `/api/*.js` (Vercel serverless functions)
- **Do NOT touch:** `.github/workflows/` (CI/CD files written by Claude Code)
- **Do NOT touch:** `supabase/` migrations
- **Do NOT touch:** `server.js` except for Task 5 fixes
- **Do NOT hardcode:** domain names, Vercel project URLs, or IP addresses in source code
- **Do NOT commit:** `.env`, `.env.staging`, `.env.production` (they are in `.gitignore`)
- **Maintain:** All existing functionality — nothing should break for end users
- **i18n:** All existing i18n keys must be preserved. Do not change any translation strings.
- **Design system:** Do not modify any UI components, styles, or Chakra theme

---

## HOW TO VERIFY YOUR WORK

After all tasks:

```bash
# 1. Local dev must still work
npm run dev
# → App loads at localhost:3000
# → API calls go to localhost:5000/api and return data

# 2. Build must succeed
npm run build
# → No errors
# → /build folder created

# 3. Check sensitive strings are NOT in the bundle
grep -r "esimaccess.com" build/static/js/
# → Should return NOTHING (empty)

grep -r "PROFIT_MARGIN\|profit_margin\|margin.*50\|50.*margin" build/static/js/
# → Should return NOTHING

# 4. Check .htaccess is in build output
ls build/.htaccess
# → File exists
```

---

## WHEN YOU ARE DONE

Do not commit or push anything. Leave the changes staged or unstaged — Claude Code will review before any commit is made.

Report back:
1. Which files you modified and why
2. Whether the verification checks passed
3. Any issues or ambiguities you encountered
