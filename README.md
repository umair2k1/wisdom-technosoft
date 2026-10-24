# Wisdom Technosoft — Website & Deployment Guide

Official corporate marketing website for **Wisdom Technosoft Pvt Ltd** (Nagpur, Maharashtra, India), delivering software development, telecalling, and data management services.

---

## 1. Hosting Architecture & Decision

- **Host:** **Cloudflare Pages (Free Plan)**.
- **Cost:** ₹0/month hosting expense. Fits comfortably within the client's budget of under ₹400/month (domain renewal is the only recurring cost).
- **Architecture:** Zero-runtime static asset distribution on Cloudflare's global edge network, with an optional minimal serverless Pages Function for contact form handling.

### Cloudflare Pages Free Plan Limits to Respect
1. **Unmetered Static Requests:** Bandwidth and static asset requests are not metered.
2. **File Limit:** Up to 20,000 files per deployment (this site uses under 30 files total).
3. **Monthly Build Limits:** ~500 builds per month on the free tier. Avoid "build on every keystroke" CI triggers; push commits in logical batches.
4. **Serverless Functions:** Server-side code runs as Cloudflare Pages Functions (`/functions`) subject to the Workers free-plan limits (100,000 requests/day, 10ms CPU time per request). The contact function is lightweight (< 1ms execution).

---

## 2. Cloudflare Pages Setup & Build Configuration

### Step-by-Step Deployment
1. **Repository:** Push this repository to GitHub (or GitLab).
2. **Connect to Cloudflare Pages:**
   - Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select the `wisdom-technosoft` repository.
3. **Build Settings:**
   | Setting | Value |
   |---|---|
   | **Framework preset** | `Astro` (or `None` / `Custom`) |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | `/` |
4. **Node Version Pinning:**
   - The repository pins Node.js via `.nvmrc` (`20.18.3`).
   - In Cloudflare Pages project settings, add the environment variable:
     - Variable name: `NODE_VERSION`
     - Value: `20.18.3`
5. **Branch Deployment Strategy:**
   - **Production branch:** `main` (automatically deploys to the live domain).
   - **Preview branches:** Every other branch / pull request generates an automatic, isolated preview URL (e.g. `<branch>.<project>.pages.dev`) for client review before merging.

---

## 3. Environment Variables

Configure environment variables in the Cloudflare Dashboard under:
**Project > Settings > Environment variables > Production and Preview**.

| Variable | Description | Example / Default |
|---|---|---|
| `SITE_URL` | Canonical base URL (use your `*.pages.dev` URL until a custom domain is acquired) | `https://wisdom-technosoft.pages.dev` |
| `DESTINATION_EMAIL` | Inbox where contact form submissions are delivered | `wisdomtechnosoft04@gmail.com` |
| `WHATSAPP_NUMBER` | Official WhatsApp number (country code + 10 digits, no `+` or spaces) | `917447331127` |
| `FORM_SERVICE_KEY` | Optional API key for email forwarding (e.g. [Web3Forms](https://web3forms.com)) | *(Optional string)* |
| `NODE_VERSION` | Pinned Node version for reproducible Cloudflare CI builds | `20.18.3` |

> **Security Note:** Never commit secret keys or real `.env` files into Git. Use `.env.example` as the blueprint.

---

## 4. Custom Domain & DNS Configuration (Optional)

> **No domain yet? No problem:** Cloudflare Pages automatically assigns a free, perpetual, SSL-secured **`https://<project-name>.pages.dev`** domain (for example, `https://wisdom-technosoft.pages.dev`). You can run the live website on this address immediately. When the client purchases or points a custom domain later, connect it via **Custom domains** in the dashboard with zero downtime.

Once domain ownership and DNS management details are confirmed (see `CONTENT_TODO.md`), configure DNS following either option:

### Option A: Recommended Path (Cloudflare Full DNS)
*Simplest, zero-maintenance SSL, automatic HTTP/2 & HTTP/3, and DDoS protection.*

1. In the Cloudflare Dashboard, click **Add a site** and enter the registered domain (e.g. `wisdomtechnosoft.com`).
2. Select the **Free** plan.
3. Cloudflare will scan existing DNS records. Verify that no records are missed.
4. Note the two Cloudflare nameservers assigned (e.g. `aria.ns.cloudflare.com` and `noah.ns.cloudflare.com`).
5. Log into the domain registrar (GoDaddy, Namecheap, Hostinger, etc.) and update the domain's custom nameservers to Cloudflare's assigned pair.
6. In Cloudflare Pages project:
   - Go to **Custom domains** > **Set up a domain**.
   - Enter `wisdomtechnosoft.com` (and `www.wisdomtechnosoft.com`).
   - Cloudflare wires the DNS CNAME records automatically and provisions Universal SSL certificates with auto-renewal.

### Option B: Alternative Path (External DNS Registrar)
*Use if the client insists on keeping DNS at their external registrar.*

1. **`www` subdomain:** Create a `CNAME` record for `www` pointing to `<project>.pages.dev`.
2. **Apex / Bare domain (`domain.com`):** Requires **CNAME flattening** or an **ALIAS / ANAME** record pointing to `<project>.pages.dev`.
   - *Caution:* If the registrar does not support CNAME flattening on the apex domain, use **Option A**.

### Canonical Hostname & 301 Redirects
Pick one canonical format (e.g., apex `https://wisdomtechnosoft.com`) and 301-redirect the other (`www.wisdomtechnosoft.com`):
1. In Cloudflare Dashboard, go to **Rules** > **Redirect Rules** (or Page Rules).
2. Add a rule:
   - When incoming request matches hostname `www.wisdomtechnosoft.com`:
   - Perform a **Dynamic 301 Redirect** to `https://wisdomtechnosoft.com/${1}`.

### HTTPS Everywhere
- Under **SSL/TLS** in Cloudflare:
  - Encryption mode: **Full** (or **Strict**).
  - Enable **Always Use HTTPS** (automatic 301 from HTTP to HTTPS).
  - Enable **Automatic HTTPS Rewrites**.

---

## 5. Critical Email & MX Records Notice

> ⚠️ **IMPORTANT (Affects DNS & Email Delivery):**
>
> - **Cloudflare Pages hosts websites, NOT email inboxes.**
> - The client currently uses a Gmail inbox (`wisdomtechnosoft04@gmail.com`).
> - If the client later purchases branded corporate email (e.g. `info@wisdomtechnosoft.com`, `contact@wisdomtechnosoft.com`) via Google Workspace, Zoho Mail, or Microsoft 365:
>   - Branded email is a **separate paid service**.
>   - Its **MX**, **SPF (TXT)**, and **DKIM (TXT/CNAME)** records must be added into the active DNS provider.
>   - If nameservers were migrated to Cloudflare (Option A), those MX and TXT records **must be added in the Cloudflare DNS dashboard**.
>   - Never delete or overwrite MX records when making website DNS changes.

---

## 6. Hosting-Related Files

- **`public/_headers` (and root `_headers`):**
  - Applied automatically by Cloudflare Pages to responses.
  - Security headers enforced:
    - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
    - `X-Frame-Options: DENY` (anti-clickjacking)
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: accelerometer=(), camera=(), geolocation=(), microphone=(), payment=()`
    - `Content-Security-Policy`: Clean CSP restricting script and style origins to self and Google Fonts.
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS)
  - Caching rules:
    - `/assets/*`: 1-year immutable caching (`public, max-age=31536000, immutable`).
    - CSS/JS: 1-day with `stale-while-revalidate`.
    - HTML: `public, max-age=0, must-revalidate` (instant updates).

- **`public/_redirects` (and root `_redirects`):**
  - Clean redirects for shortcut routes (`/services`, `/contact`, `/about`, `/team`, `/privacy`).

- **`404.html` (and `public/404.html`):**
  - Fully responsive custom 404 page styled with company typography, brand mark, direct navigation back to home/services, and fallback direct contact details.

- **`privacy.html` (and `public/privacy.html`):**
  - Clean privacy notice covering form collection, zero-tracking policy, and compliance standards.

---

## 7. Contact Form & Pages Function (`/functions`)

The site includes both client-side and server-side contact processing:
- **Client surface (`index.html`):**
  - Inputs: Name, Email, Phone/WhatsApp, Service Interest, Message.
  - Spam honeypot field (`website_url`) hidden via CSS/tabindex.
  - Direct WhatsApp button ("Chat on WhatsApp").
  - Click-to-call link (`+91 74473 31127`) and email link (`wisdomtechnosoft04@gmail.com`).
  - Privacy micro-copy linked to `/privacy.html`.
- **Pages Function (`functions/api/contact.js`):**
  - Endpoint: `POST /api/contact`
  - Validates field constraints and email regex.
  - Checks honeypot field (silently suppresses spam bots).
  - Forwards to email delivery service when `FORM_SERVICE_KEY` is set.
  - Zero dependencies, executes in under 1ms CPU time.

---

## 8. Privacy & Compliance (Section 9.8)

1. **Short Privacy Notice:** Documented at `/privacy.html` and linked in site navigation and contact form footer.
2. **Zero Tracking at Launch:** Zero third-party trackers, zero advertising pixels, zero tracking cookies.
3. **No Unnecessary Embeds:** No third-party iframes or surveillance widgets. Google Maps link opens cleanly in an external tab without tracking user sessions.

---

## 9. Local Development & Build Commands

This static site uses a fast, zero-dependency Node.js build pipeline:

```bash
# Build the production output into dist/
npm run build

# Start local preview server (serves dist/ on port 3000)
npm run preview

# Or start dev server directly
npm run dev
```

Visit `http://localhost:3000` to preview the site locally.
