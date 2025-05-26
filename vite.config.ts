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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          motion: ['framer-motion'],
          grid: ['react-grid-layout'],
        },
      },
    },
    emptyOutDir: true, // Clear the dist directory before each build
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  // Ensure the public directory is copied correctly
  publicDir: 'public',
  server: {
    https: false,
    hmr: {
      overlay: false,
    },
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'framer-motion',
      'react-grid-layout',
    ],
    force: true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
    target: 'es2020',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  css: {
    codeSplit: true,
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
  experimental: {
    renderBuiltUrl(filename) {
      return filename;
    },
  },
}); 