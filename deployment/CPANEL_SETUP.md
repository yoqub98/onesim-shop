# cPanel Setup Guide
## Manual steps — done by you in Ahost.uz cPanel
### Do this AFTER Claude says "Code is ready. Now do the cPanel and GitHub setup."

---

## What You Are Setting Up

- `onesim.uz` → serves production React app (static files)
- `stg.onesim.uz` → serves staging React app (static files)
- No Node.js, no build process on cPanel — Apache serves static files only
- GitHub Actions will upload files here via FTP automatically

---

## STEP 1 — Find Your cPanel Server IP

You will need this for DNS.

1. Log in to Ahost.uz cPanel
2. Go to **Server Information** or check the welcome email
3. Note down the **server IP address** — looks like `xxx.xxx.xxx.xxx`

---

## STEP 2 — Create Folders for Each Environment

You need two separate folders on the server.

1. In cPanel → **File Manager**
2. Navigate to `public_html/`
3. Create folder: `public_html/prod/`
4. Create folder: `public_html/staging/`

These folders will receive the built React app files from GitHub Actions.

---

## STEP 3 — Set Up the Main Domain

1. cPanel → **Domains** (or **Addon Domains** / **Domain Manager**)
2. If `onesim.uz` is not already pointed here — add it as the primary domain or addon domain
3. Set its **Document Root** to `/public_html/prod/`

---

## STEP 4 — Create Subdomain for Staging

1. cPanel → **Subdomains**
2. Create subdomain: `stg`
3. Domain: `onesim.uz` → result is `stg.onesim.uz`
4. Document Root: `/public_html/staging/`
5. Click **Create**

---

## STEP 5 — Create FTP Accounts

You need two separate FTP accounts so GitHub Actions can upload files. Each account is restricted to its own folder.

**FTP Account 1 — Production:**
1. cPanel → **FTP Accounts**
2. Username: `deploy-prod` (or similar)
3. Password: generate a strong random password — **save it somewhere safe**
4. Directory: `/public_html/prod/`
5. Quota: Unlimited
6. Click **Create FTP Account**

**FTP Account 2 — Staging:**
1. cPanel → **FTP Accounts**
2. Username: `deploy-staging` (or similar)
3. Password: generate a strong random password — **save it somewhere safe**
4. Directory: `/public_html/staging/`
5. Quota: Unlimited
6. Click **Create FTP Account**

**Note the FTP host:** Usually `ftp.onesim.uz` or the server IP. Check the FTP account details after creation.

---

## STEP 6 — Upload `.htaccess` Files

This file is needed so that React Router works correctly (no 404 on page refresh).

**For BOTH `/public_html/prod/` and `/public_html/staging/`:**

1. In cPanel → **File Manager**
2. Navigate to the folder
3. Click **New File** → name it `.htaccess`
4. Open the file with the text editor
5. Paste this content exactly:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

6. Save

> **Note:** This `.htaccess` will be overwritten by the first GitHub Actions deploy — that's fine, the deploy includes the correct `.htaccess` from the React build. You just need it there initially so the folder isn't empty.

---

## STEP 7 — Enable SSL (HTTPS)

Do this for both domains.

1. cPanel → **SSL/TLS** → **Let's Encrypt SSL** (or similar — Ahost.uz may call it differently)
2. Install SSL for `onesim.uz`
3. Install SSL for `stg.onesim.uz`
4. Enable **Force HTTPS Redirect** for both

If Let's Encrypt is not available, contact Ahost.uz support — all plans should include free SSL.

---

## STEP 8 — Add GitHub Secrets

This is where you securely store FTP credentials so GitHub Actions can use them.

1. Go to your GitHub repository
2. Click **Settings** tab
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret** for each item below:

| Secret Name | Value |
|-------------|-------|
| `FTP_HOST` | Your FTP host (e.g. `ftp.onesim.uz`) |
| `FTP_USER_PROD` | FTP username for production |
| `FTP_PASS_PROD` | FTP password for production |
| `FTP_USER_STAGING` | FTP username for staging |
| `FTP_PASS_STAGING` | FTP password for staging |

---

## STEP 9 — Set Up Vercel Staging Project

You need two Vercel projects: one already exists for production API.

**Create staging Vercel project:**
1. Go to vercel.com → **Add New Project**
2. Import the same GitHub repository (`onesim-shop`)
3. In configuration:
   - **Project Name:** `onesim-shop-staging`
   - **Branch to deploy:** `staging`
   - **Root directory:** leave as default (`/`)
4. Click **Deploy**
5. After deploy → go to project **Settings** → **Domains**
6. Note the auto-generated URL (e.g. `onesim-shop-staging.vercel.app`) — you'll need this

**Add environment variables to staging Vercel project:**
Go to project Settings → Environment Variables. Add all the same variables as production but mark them for `Preview` / `staging` branch:

| Variable | Value |
|----------|-------|
| `ESIMACCESS_API_KEY` | your API key |
| `ESIMACCESS_SECRET_KEY` | your secret key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `SYNC_SECRET_KEY` | your sync secret |
| `SMTP_HOST` | your SMTP host |
| `SMTP_PORT` | your SMTP port |
| `SMTP_USER` | your SMTP user |
| `SMTP_PASS` | your SMTP password |

**Add environment variables to production Vercel project (same list):**
Go to your existing prod Vercel project → Settings → Environment Variables → verify all the same vars are set for `Production` environment.

---

## STEP 10 — Add Vercel API URLs to GitHub Secrets

After Step 9, you have two Vercel API URLs. Add them to GitHub Secrets:

| Secret Name | Value |
|-------------|-------|
| `REACT_APP_API_BASE_STAGING` | (leave empty — frontend uses `/api` relative path) |
| `REACT_APP_API_BASE_PROD` | (leave empty — frontend uses `/api` relative path) |

> **Note:** These may not actually be needed if relative `/api` paths work correctly. Claude Code will confirm after reviewing Codex's changes. For now, just know where to add them if needed.

---

## STEP 11 — DNS Configuration

Point your domains to the cPanel server.

**In your domain registrar (wherever onesim.uz DNS is managed):**

1. Find DNS Management / DNS Records
2. Add or update:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` (or `onesim.uz`) | `[your cPanel server IP]` | 300 |
| A | `stg` (or `stg.onesim.uz`) | `[your cPanel server IP]` | 300 |

3. Save changes
4. DNS propagation takes 15 minutes to 2 hours
5. Check at `https://dnschecker.org` — search `onesim.uz` and wait until it shows your IP

---

## STEP 12 — Verify Everything

Once DNS is propagated and GitHub Actions has run:

- [ ] Open `https://stg.onesim.uz` — should load the React app
- [ ] Open `https://onesim.uz` — should load the React app
- [ ] Click a navigation link, then refresh — should NOT show 404
- [ ] Check that SSL padlock shows in browser for both URLs

---

## How Deployments Work After Setup

**You push code to `staging` branch:**
→ GitHub Actions wakes up automatically (no action needed from you)
→ Builds the app (~2 min)
→ Uploads to `/public_html/staging/`
→ `stg.onesim.uz` is updated

**You want to go to production:**
```bash
git checkout main
git merge staging
git push origin main
```
→ GitHub Actions builds and uploads to `/public_html/prod/`
→ `onesim.uz` is updated

---

## cPanel GitHub Integration — IMPORTANT NOTE

You may see "Git Version Control" in cPanel. **Do NOT use it for deployment.**

That tool pulls source code from GitHub and would need to run `npm run build` on the cPanel server — which uses too much RAM on shared hosting and risks getting your account blocked.

Instead, GitHub Actions builds on GitHub's servers and sends only the finished files to cPanel via FTP. cPanel just stores and serves the files. This is why we set up FTP accounts instead of using cPanel's Git tool.

---

## If You Get Stuck

Things to check:
- FTP credentials correct in GitHub Secrets (no extra spaces)
- GitHub Actions tab in the repo shows the workflow run and any error messages
- cPanel File Manager shows files appearing in `/public_html/prod/` after a push to `main`
- `.htaccess` file exists in the folder

Contact Claude Code with the exact error message from GitHub Actions logs.
