// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server', // 👈 activa modo SSR
  adapter: node({ mode: 'standalone', sessions: false }),
 // o 'server' según prefieras
  vite: {
    plugins: [tailwindcss(),tailwindcss()]
  },
  integrations: [vue()],
});