import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pwaConfig from './pwa.config.js';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    port: 8000,
    open: false,
  },
  plugins: [
    VitePWA(pwaConfig)
  ],
});
