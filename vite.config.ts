import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR can be disabled via DISABLE_HMR env var.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Proxy API calls to the Express backend (`npm run dev` in /server on port 8787).
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') || '/',
      },
    },
  },
  build: {
    // Main bundle includes React + Firebase; pdf worker is separate. Keeps CI output readable.
    chunkSizeWarningLimit: 1100,
  },
});