# Wisdom Technosoft — Content & Client Open Questions (CONTENT_TODO)

This document tracks items that require confirmation, real client assets, or domain configuration before final production launch.

---

## 1. Domain & DNS (Section 9.7 & Question 4)
- [ ] **Exact Domain Name:** Confirm client's registered domain (e.g. `wisdomtechnosoft.com` or `.in`).
- [ ] **DNS Controller:** Identify who currently manages registrar access (GoDaddy, Namecheap, BigRock, Hostinger, etc.).
- [ ] **Nameserver Migration:** Confirm approval to point nameservers to Cloudflare for automatic SSL, DDoS protection, and edge caching.

---

## 2. Business Email & Mailbox (Section 9.7 Email Note)
- [ ] **Current Contact Email:** Currently set to `wisdomtechnosoft04@gmail.com`.
- [ ] **Future Branded Inboxes:** If branded email (e.g. `info@domain.com`) is provisioned via Google Workspace or Zoho, add required `MX`, `SPF`, and `DKIM` records into Cloudflare DNS.

---

## 3. Contact Form & WhatsApp (Section 9.4 & Question 3)
- [ ] **WhatsApp Number:** Verify that `+91 74473 31127` is the official WhatsApp business inquiry line.
- [ ] **Form Forwarding Service:** Register for a free form forwarding key (e.g. at [Web3Forms](https://web3forms.com)) and set `FORM_SERVICE_KEY` in Cloudflare Pages dashboard.

---

## 4. Projects Showcase (Section 10 & Question 1)
- [ ] **Real Case Studies:** Request 3 to 4 real client projects with:
  - Project Title & Category (Software, Telecalling, or Data Entry)
  - Short summary & full scope
  - Client name (or marked confidential / NDA)
  - Screenshots / live links (if public)
  - Measurable results / outcomes

---

## 5. Team & Leadership (Section 6.5 & Question 2)
- [ ] **Bios & Real Titles:** Confirm official designations, exact name spellings, and headshots for the core team:
  - Mohammad Aashir (Managing Director)
  - Mohammad Faizan (Chief Executive Officer)
  - Mohd Arsh (Director)
  - Aftab Ansari (Consultant)

---

## 6. Brand & Copy Details (Section 11 & 12)
- [ ] **Founding Year:** Confirm whether founding year framing should be "Since 2023" or "Established 2024" (both appear in the source deck).
- [ ] **Business Hours:** Confirm operating hours (e.g. Mon–Sat 9:00 AM – 7:00 PM IST) to display on the contact section.
- [ ] **Future Translations:** Hindi (`/hi/`) and Urdu (`/ur/`) language support is deferred for post-launch once translated copy is supplied.
