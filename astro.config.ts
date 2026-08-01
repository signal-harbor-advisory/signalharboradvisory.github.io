import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://signalharboradvisory.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    sitemap({
      // Exclude non-indexable utility pages
      filter: (page) =>
        !page.includes('/contact/confirm') &&
        !page.includes('/contact/error'),
    }),
  ],
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'never',
  },
});
