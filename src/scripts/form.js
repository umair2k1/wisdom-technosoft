/* Contact form. Posts to /api/contact; if the endpoint is not available
   (static hosting), hands the same details to email / WhatsApp instead. */
import { site } from '../data/site.js';

/* Point PUBLIC_FORM_ENDPOINT (see .env.example) at a form service or your own API.
   Default is the bundled /api/contact route, which needs a server adapter. */
const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT || '/api/contact';

const form = document.querySelector('[data-contact-form]');

if (form) {
  const $ = (selector) => form.querySelector(selector);
  const submitButton = $('button[type="submit"]');
  const submitLabel = $('[data-submit-label]');
  const successPanel = $('[data-form-success]');
  const errorPanel = $('[data-form-error]');
  const fallbackPanel = $('[data-form-fallback]');
  const fallbackMail = $('[data-fallback-mail]');
  const fallbackWhatsApp = $('[data-fallback-whatsapp]');

  const defaultSuccess = 'Thank you. Your inquiry has been received. We reply within 1 business day.';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const hidePanels = () => {
    [successPanel, errorPanel, fallbackPanel].forEach((panel) => {
      if (panel) panel.hidden = true;
    });
  };

  const showPanel = (panel, message) => {
    hidePanels();
    if (!panel) return;
    if (message) panel.textContent = message;
    panel.hidden = false;
  };

  const buildFallback = (payload) => {
    hidePanels();
    const subject = `Website inquiry — ${payload.service}`;
    const body = [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone / WhatsApp: ${payload.phone || 'Not provided'}`,
      `Service: ${payload.service}`,
      '',
      'Project overview:',
      payload.message,
    ].join('\n');

    if (fallbackMail) {
      fallbackMail.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    if (fallbackWhatsApp) {
      fallbackWhatsApp.href = `${site.whatsappUrl}%0A%0A${encodeURIComponent(`${subject}\n\n${body}`)}`;
    }
    if (fallbackPanel) fallbackPanel.hidden = false;
  };

  const setBusy = (busy) => {
    if (submitButton) submitButton.disabled = busy;
    if (submitLabel) submitLabel.textContent = busy ? 'Sending…' : 'Send inquiry';
    form.setAttribute('aria-busy', String(busy));
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const field = (key) => String(data.get(key) ?? '').trim();
    const payload = {
      name: field('name'),
      email: field('email'),
      phone: field('phone'),
      service: field('service'),
      message: field('message'),
      website_url: field('website_url'),
    };

    /* Honeypot: pretend it worked. */
    if (payload.website_url) {
      showPanel(successPanel, defaultSuccess);
      form.reset();
      return;
    }

    if (payload.name.length < 2 || !emailPattern.test(payload.email) || payload.message.length < 5) {
      showPanel(errorPanel, 'Please check your name, email address and project overview, then try again.');
      return;
    }
    if (payload.message.length > 3000) {
      showPanel(errorPanel, 'Your project overview is too long. Please keep it under 3000 characters.');
      return;
    }

    hidePanels();
    setBusy(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      const failed = result && (result.ok === false || result.success === false);
      if (response.ok && !failed && (result || endpoint !== '/api/contact')) {
        showPanel(successPanel, (result && result.message) || defaultSuccess);
        form.reset();
      } else if (response.status === 400 && result && result.message) {
        showPanel(errorPanel, result.message);
      } else {
        buildFallback(payload);
      }
    } catch (err) {
      buildFallback(payload);
    } finally {
      setBusy(false);
    }
  });
}
