import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact(), crx({ manifest })],
  server: {
    port: 5173,
    strictPort: false,
    cors: {
      origin: [
        /chrome-extension:\/\//,
      ],
    },
  }
});
