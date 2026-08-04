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
  esbuild: {
    // Strip debug chatter from production bundles. console.error is deliberately
    // kept -- 46 call sites use it for real failure reporting in catch blocks.
    pure: ['console.log', 'console.debug', 'console.info'],
  },
  build: {
    rollupOptions: {
      output: {
        // Resolved per-module rather than by entry name: the array form let React
        // get pulled into whichever chunk imported it first (leaving `react-vendor`
        // empty), because react-router-dom depends on react.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          const after = id.replace(/\\/g, '/').split('node_modules/').pop() ?? '';
          const pkg = after.startsWith('@')
            ? after.split('/').slice(0, 2).join('/')
            : after.split('/')[0];

          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') return 'react-vendor';
          if (pkg === 'react-router' || pkg === 'react-router-dom' || pkg === '@remix-run/router') {
            return 'router';
          }
          if (pkg === 'framer-motion' || pkg === 'lucide-react' || pkg === 'sonner') return 'ui';
          if (pkg === 'react-hook-form') return 'form';
          if (pkg.startsWith('@supabase/') || pkg === 'date-fns') return 'data';
        },
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
});