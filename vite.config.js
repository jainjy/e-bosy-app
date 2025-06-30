import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'process.env': {},
  },
  optimizeDeps: {
    exclude: ['simple-peer'],
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      events: 'events',
      util: 'util',
    },
  },
});