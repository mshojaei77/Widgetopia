import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy the manifest.json file to the dist directory
        copyFileSync('manifest.json', 'dist/manifest.json');
        console.log('Manifest file copied to dist directory');
      }
    }
  ],
  build: {
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      }
    },
    emptyOutDir: true, // Clear the dist directory before each build
  },
  // Ensure the public directory is copied correctly
  publicDir: 'public',
}); 