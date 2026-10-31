import type { APIRoute } from 'astro';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_MESSAGE = 'Thank you. Your inquiry has been received. We reply within 1 business day.';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;

  try {
    const raw = await request.text();
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: 'Please send the inquiry as a JSON body.' }, 415);
  }

  const websiteUrl = String(body.website_url ?? '').trim();

  if (websiteUrl.length > 0) {
    return json({ ok: true, message: 'Received' });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const service = String(body.service ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (name.length < 2 || name.length > 120) {
    return json({ ok: false, message: 'Please enter your name.' }, 400);
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 160) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  if (phone.length > 40) {
    return json({ ok: false, message: 'Please shorten the phone number.' }, 400);
  }

  if (service.length > 120) {
    return json({ ok: false, message: 'Please choose a service.' }, 400);
  }

  if (message.length < 5 || message.length > 3000) {
    return json({ ok: false, message: 'Please describe your project in 5 to 3000 characters.' }, 400);
  }

  return json({ ok: true, message: SUCCESS_MESSAGE });
};
