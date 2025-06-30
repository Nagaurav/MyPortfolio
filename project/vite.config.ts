import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
    ViteImageOptimizer({
      jpg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['framer-motion', 'lucide-react', 'sonner'],
          'form': ['react-hook-form'],
          'data': ['@supabase/supabase-js', 'date-fns'],
        },
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});