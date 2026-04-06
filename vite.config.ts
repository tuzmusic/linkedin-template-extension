import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';
import preact from '@preact/preset-vite';
import zip from 'vite-plugin-zip-pack'

export default defineConfig({
  plugins: [
    preact(),
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: 'release.zip' }),
  ],
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
