import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    'process': JSON.stringify({ env: {} }),
    'global': 'window'
  },
  resolve: {
    alias: {
      'simple-peer': 'simple-peer/simplepeer.min.js',
      'buffer': 'buffer/',
      'stream': 'stream-browserify',
      'crypto': 'crypto-browserify'
    }
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',      '@react-pdf-viewer/core',
      '@react-pdf-viewer/default-layout',
      'pdfjs-dist'
    ],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    proxy: {
        '/livehub': {
            target: 'http://192.168.0.181:5000',
            changeOrigin: true,
            ws: true,
            secure: false
        }
    },host:true
}, build: {
  commonjsOptions: {
    include: [/node_modules/],
  }},
});
