// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['*.glb'],
  optimizeDeps: {
    exclude: ['*.glb']
  },
  build: {
    rollupOptions: {
      external: ['*.glb']
    },
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@models': '/public/models'
    }
  },
  define: {
    'process.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL)
  }
});
