import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.PUBLIC_SITE_URL || 'https://finformat.pages.dev';

export default defineConfig({
  output: 'static',
  site: siteUrl,
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    format: 'directory'
  }
});
