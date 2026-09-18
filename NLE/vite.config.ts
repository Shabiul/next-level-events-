import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const __dirname = import.meta.dirname

function staticCachePlugin() {
  return {
    name: 'vite-plugin-static-cache',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (/\.(jpe?g|png|webp|svg|gif|mp4|webm|woff2?)$/i.test(req.url || '')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
        next();
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (/\.(jpe?g|png|webp|svg|gif|mp4|webm|woff2?)$/i.test(req.url || '')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), staticCachePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: false,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({ error: 'Backend server offline', standalone: true }));
            }
          });
        },
      },
      '/share': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              (res as any).writeHead(503, { 'Content-Type': 'text/plain' });
              (res as any).end('Backend server offline');
            }
          });
        },
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons') || id.includes('node_modules/@heroicons')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
})
