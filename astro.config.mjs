// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://curiosidadevs.com',
  integrations: [react()],
  // Todo el sitio sigue siendo estático; solo /api/donar corre en el servidor.
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  env: {
    schema: {
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
