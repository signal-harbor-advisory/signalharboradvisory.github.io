import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://signalharboradvisory.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    sitemap({
      // Exclude non-indexable utility pages and pages still marked
      // noindex (Privacy/Terms are placeholder text pending legal review)
      filter: (page) =>
        !page.includes('/contact/confirm') &&
        !page.includes('/contact/error') &&
        !page.includes('/privacy') &&
        !page.includes('/terms'),
    }),
  ],
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'never',
  },
});
