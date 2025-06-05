import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy the manifest.json file to the dist directory
        copyFileSync('manifest.json', 'dist/manifest.json');
        console.log('Manifest file copied to dist directory');
      }
    },
    {
      name: 'normalize-paths',
      generateBundle(options, bundle) {
        // Normalize all file paths to use forward slashes
        Object.keys(bundle).forEach(fileName => {
          const normalizedFileName = fileName.replace(/\\/g, '/');
          if (normalizedFileName !== fileName) {
            bundle[normalizedFileName] = bundle[fileName];
            delete bundle[fileName];
          }
        });
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
        // Security: Remove unsafe patterns
        unsafe: false,
        unsafe_Function: false,
        unsafe_regexp: false,
      },
      mangle: {
        // Avoid mangling that could create Function constructors
        reserved: ['Function', 'eval'],
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: (assetInfo) => {
          // Keep favicon files in root and icons in icons folder
          if (assetInfo.name === 'favicon.ico') {
            return 'favicon.ico';
          }
          if (assetInfo.name && assetInfo.name.startsWith('icon')) {
            return `icons/[name].[ext]`;
          }
          return `assets/[name].[ext]`;
        },
        // Ensure paths use forward slashes in archives
        dir: 'dist',
        format: 'es',
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

  experimental: {
    renderBuiltUrl(filename) {
      return filename;
    },
  },
}); 