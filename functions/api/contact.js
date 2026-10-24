/**
 * Cloudflare Pages Function: Contact Form Handler
 * Endpoint: POST /api/contact
 *
 * Designed to execute well within the Cloudflare Workers Free Tier limits:
 * - Minimal CPU consumption (< 1ms execution time)
 * - Zero external npm dependencies
 * - Built-in honeypot spam suppression
 * - Strict input validation
 * - Graceful fallback to direct contact methods
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // JSON headers
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': env.SITE_URL || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    let body = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message'),
        website_url: formData.get('website_url'),
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Unsupported content type.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // 1. Honeypot check: If the hidden honeypot field is filled, silently discard spam
    if (body.website_url && String(body.website_url).trim().length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Message received.' }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // 2. Validate inputs
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const service = (body.service || 'General Inquiry').trim();
    const message = (body.message || '').trim();

    if (!name || name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid name (2-100 characters).' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 120) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid email address.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!message || message.length < 5 || message.length > 3000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a message (5-3000 characters).' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const destinationEmail = env.DESTINATION_EMAIL || 'wisdomtechnosoft04@gmail.com';
    const formServiceKey = env.FORM_SERVICE_KEY;

    // 3. Forward message if an external service key (e.g. Web3Forms) is configured
    if (formServiceKey) {
      const emailPayload = {
        access_key: formServiceKey,
        subject: `New Inquiry from ${name} [${service}]`,
        from_name: 'Wisdom Technosoft Website',
        to_email: destinationEmail,
        name: name,
        email: email,
        phone: phone || 'Not provided',
        service: service,
        message: message,
      };

      const forwardRes = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (!forwardRes.ok) {
        console.error('Form forward failed with status:', forwardRes.status);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Email service delivery error. Please email us directly at ' + destinationEmail,
          }),
          { status: 502, headers: jsonHeaders }
        );
      }
    } else {
      // In development or prior to setting FORM_SERVICE_KEY, log inquiry safely
      console.log('Inquiry received (FORM_SERVICE_KEY not set):', {
        name,
        email,
        phone,
        service,
        chars: message.length,
        destination: destinationEmail,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.',
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    console.error('Contact handler error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An internal error occurred. Please contact us at wisdomtechnosoft04@gmail.com',
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
}

export async function onRequestOptions(context) {
  const { env } = context;
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.SITE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
