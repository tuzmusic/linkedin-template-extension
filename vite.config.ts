import { defineConfig } from 'vite';
import preactPlugin from 'preact/preset/vite';
import { crxPlugin } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [preactPlugin(), crxPlugin()],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
