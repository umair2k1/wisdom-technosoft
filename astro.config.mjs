import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://wisdomtechnosoft.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
