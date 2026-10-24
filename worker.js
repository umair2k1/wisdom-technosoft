import { onRequestPost, onRequestOptions } from './functions/api/contact.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle contact form API endpoint
    if (url.pathname === '/api/contact') {
      if (request.method === 'POST') {
        return onRequestPost({
          request,
          env,
          params: {},
          data: {},
          waitUntil: ctx.waitUntil ? ctx.waitUntil.bind(ctx) : () => {},
          next: () => env.ASSETS.fetch(request),
        });
      }
      if (request.method === 'OPTIONS') {
        return onRequestOptions({ request, env });
      }
    }

    // Pass through to static assets in dist/
    return env.ASSETS.fetch(request);
  },
};
