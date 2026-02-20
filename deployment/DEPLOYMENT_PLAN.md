# OneSIM Deployment Plan
## Vercel (API) + cPanel (Frontend) + GitHub Actions (CI/CD)
### Target: onesim.uz (prod) + stg.onesim.uz (staging)

---

## Architecture Overview

```
GitHub (code storage)
    │
    ├── branch: staging ──► GitHub Actions builds ──► FTP upload ──► stg.onesim.uz (cPanel)
    │                  └──► Vercel auto-deploys staging API
    │
    └── branch: main ────► GitHub Actions builds ──► FTP upload ──► onesim.uz (cPanel)
                       └──► Vercel auto-deploys production API
```

**Vercel** = API serverless functions only (no frontend)
**cPanel** = serves React static build files only (no Node.js, no build process)
**GitHub Actions** = does the `npm run build`, runs on GitHub's servers (not your hosting)

---

## Collaboration Key

| Symbol | Party |
|--------|-------|
| 🤖 Claude Code | Autonomous — does it in your repo directly |
| 🧠 Codex | AI agent — fed separate task file |
| 👤 You | Manual — requires your access or account |

---

## ALL TASKS IN ORDER

---

### PHASE 0 — Claude Does His Part (no Codex yet)

| # | Task | Who | Description |
|---|------|-----|-------------|
| 0.1 | Security audit of exposed env vars | 🤖 Claude | Check which `REACT_APP_*` vars are baked into the JS bundle and are visible to end users. Flag sensitive ones (margin, API source). |
| 0.2 | Create GitHub Actions workflow — staging | 🤖 Claude | `.github/workflows/deploy-staging.yml` — triggers on push to `staging` branch, builds React app, FTPs `/build` to cPanel staging folder |
| 0.3 | Create GitHub Actions workflow — production | 🤖 Claude | `.github/workflows/deploy-production.yml` — triggers on push to `main` branch, builds React app, FTPs `/build` to cPanel prod folder |
| 0.4 | Create environment variable templates | 🤖 Claude | `.env.staging.example` and `.env.production.example` — documents every variable needed per environment, with safe placeholder values |
| 0.5 | Update `.gitignore` | 🤖 Claude | Ensure `.env`, `.env.staging`, `.env.production` are ignored. Ensure `/build` is NOT committed. |
| 0.6 | Write `deployment/CODEX_TASKS.md` | 🤖 Claude | Detailed instructions for Codex (already done — this document) |
| 0.7 | Write `deployment/CPANEL_SETUP.md` | 🤖 Claude | Step-by-step guide for you to follow in cPanel |

> **After Phase 0:** Claude says "I am done. Now run Codex."

---

### PHASE 1 — Codex Does His Part

| # | Task | Who | Description |
|---|------|-----|-------------|
| 1.1 | Security fix — sensitive vars | 🧠 Codex | Remove `REACT_APP_PROFIT_MARGIN`, `REACT_APP_ESIMACCESS_API_URL` from frontend bundle. These must NOT be visible in browser DevTools. Move any pricing logic that uses them to server-side only. |
| 1.2 | Environment-aware API URL | 🧠 Codex | Frontend must call the correct Vercel API depending on environment. Staging build → staging Vercel URL. Prod build → prod Vercel URL. This is injected at build time via GitHub Actions, not hardcoded. |
| 1.3 | Vercel staging project config | 🧠 Codex | Update `vercel.json` to support two environments (staging branch, main branch). Add correct CORS origins (`stg.onesim.uz` for staging, `onesim.uz` for prod). |
| 1.4 | SPA routing fix | 🧠 Codex | Add a `public/_redirects` or equivalent so that React Router deep links (e.g. `onesim.uz/mypage`) do not return 404 when user refreshes. For Apache (cPanel), this means an `.htaccess` file in the build output. |
| 1.5 | Review and clean `server.js` | 🧠 Codex | `server.js` is only used for local development. Confirm it still works correctly for `npm run dev`. No prod logic should depend on it. |

> **After Phase 1:** You tell Claude "Codex finished." Claude reviews what Codex did.

---

### PHASE 2 — Claude Reviews Codex Work

| # | Task | Who | Description |
|---|------|-----|-------------|
| 2.1 | Review Codex changes | 🤖 Claude | Scan all files Codex modified. Verify no sensitive vars leaked, no conflicts with GitHub Actions workflows, API URLs are correct. |
| 2.2 | Fix anything broken | 🤖 Claude | If Codex introduced any issues, fix them. |
| 2.3 | Create `staging` branch in GitHub | 🤖 Claude | `git checkout -b staging && git push origin staging` — creates the staging branch from current main |

> **After Phase 2:** Claude says "Code is ready. Now do the cPanel and GitHub setup."

---

### PHASE 3 — You: Vercel Setup

| # | Task | Who | Description |
|---|------|-----|-------------|
| 3.1 | Create second Vercel project for staging API | 👤 You | In Vercel dashboard: new project → import same GitHub repo → set it to deploy from `staging` branch. This gives you a separate staging API URL (e.g. `onesim-shop-staging.vercel.app`) |
| 3.2 | Set env vars on Vercel PRODUCTION project | 👤 You | Add all backend secrets to prod Vercel project. Claude will give you the exact list. |
| 3.3 | Set env vars on Vercel STAGING project | 👤 You | Same vars, but staging values where different (e.g. test keys if any). |
| 3.4 | Note both Vercel API URLs | 👤 You | You will need these in GitHub Secrets (Phase 4). |

---

### PHASE 4 — You: cPanel Setup

> Follow `deployment/CPANEL_SETUP.md` exactly.

| # | Task | Who | Description |
|---|------|-----|-------------|
| 4.1 | Create subdomain `stg.onesim.uz` | 👤 You | In cPanel → Subdomains → create `stg` pointing to `/public_html/staging/` |
| 4.2 | Set document roots | 👤 You | `onesim.uz` → `/public_html/prod/`, `stg.onesim.uz` → `/public_html/staging/` |
| 4.3 | Create FTP account for staging | 👤 You | Restricted to `/public_html/staging/` only |
| 4.4 | Create FTP account for production | 👤 You | Restricted to `/public_html/prod/` only |
| 4.5 | Upload initial `.htaccess` to both folders | 👤 You | File provided by Claude in `CPANEL_SETUP.md` — needed for SPA routing |
| 4.6 | Enable SSL (Let's Encrypt) for both domains | 👤 You | cPanel → SSL/TLS → Let's Encrypt → install for `onesim.uz` and `stg.onesim.uz` |

---

### PHASE 5 — You: GitHub Secrets

| # | Task | Who | Description |
|---|------|-----|-------------|
| 5.1 | Add FTP credentials to GitHub Secrets | 👤 You | GitHub repo → Settings → Secrets → Actions. Add: `FTP_HOST`, `FTP_USER_STAGING`, `FTP_PASS_STAGING`, `FTP_USER_PROD`, `FTP_PASS_PROD` |
| 5.2 | Add Vercel API URLs to GitHub Secrets | 👤 You | `REACT_APP_API_URL_STAGING` = your staging Vercel URL, `REACT_APP_API_URL_PROD` = your prod Vercel URL |
| 5.3 | Add any other build-time env vars | 👤 You | Claude will specify exact list after Phase 2. |

---

### PHASE 6 — You: DNS

| # | Task | Who | Description |
|---|------|-----|-------------|
| 6.1 | Point `onesim.uz` A record to cPanel server IP | 👤 You | In your domain registrar (or wherever DNS is managed). Get the cPanel server IP from Ahost.uz. |
| 6.2 | Point `stg.onesim.uz` A record to same IP | 👤 You | Same IP, cPanel handles routing by subdomain. |
| 6.3 | Wait for DNS propagation | 👤 You | Usually 15 min to 2 hours. Can check via `dnschecker.org` |

---

### PHASE 7 — Testing

| # | Task | Who | Description |
|---|------|-----|-------------|
| 7.1 | Trigger staging deploy | 👤 You | Push any small change to `staging` branch. Watch GitHub Actions tab — should succeed. |
| 7.2 | Verify `stg.onesim.uz` loads | 👤 You | Open in browser. Test all pages, deep links, API calls. |
| 7.3 | Verify no sensitive data in bundle | 🤖 Claude | Review built JS to confirm margin/API keys not visible. |
| 7.4 | Trigger production deploy | 👤 You | Merge staging → main. GitHub Actions deploys to `onesim.uz`. |
| 7.5 | Verify `onesim.uz` end-to-end | 👤 You | Full smoke test: browse packages, order flow, account login. |

---

## Promote Staging → Production (ongoing workflow)

```bash
# Run this whenever staging is verified and ready to go live:
git checkout main
git merge staging
git push origin main
# GitHub Actions automatically builds and deploys to onesim.uz
```

---

## Security Checklist

- [ ] No `REACT_APP_PROFIT_MARGIN` in production JS bundle
- [ ] No eSIMAccess API URL visible in browser
- [ ] API keys only in Vercel env vars (server-side, never in frontend)
- [ ] FTP credentials only in GitHub Secrets (never in code)
- [ ] `.env` files in `.gitignore`
- [ ] Both domains have HTTPS (Let's Encrypt)
- [ ] Supabase RLS policies active (already done)
- [ ] Webhook endpoint protected (already has secret key)
