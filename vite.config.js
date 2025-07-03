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
      'process'
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
            target: 'http://localhost:5000',
            changeOrigin: true,
            ws: true,
            secure: false
        }
    }
}
});