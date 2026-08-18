import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: process.env.SITE_URL || 'https://rr3auto.com',
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind({ applyBaseStyles: false })],
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
});
