import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  // 'static' output plus a server-rendered API route (src/pages/api/*)
  // works because @astrojs/netlify supports per-route prerender overrides;
  // pages are prerendered by default, the API route opts out via
  // `export const prerender = false`.
  output: 'static',
  adapter: netlify(),

  vite: {
    plugins: [tailwindcss()],
  },
});
