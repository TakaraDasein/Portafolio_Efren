// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  
  // Optimización para Vercel
  output: 'static',
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/lib': path.resolve(__dirname, './src/lib'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendors pesados en chunks propios para mejor caching
            'vendor-react': ['react', 'react-dom'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-motion': ['framer-motion'],
            'vendor-lenis': ['lenis', '@studio-freight/lenis'],
          },
        },
      },
      // Optimizaciones de Vite compatibles con Vercel
      cssMinify: true,
      minify: 'esbuild', // esbuild es más rápido y compatible con Vercel
      chunkSizeWarningLimit: 1000,
      // Optimización de assets
      assetsInlineLimit: 4096, // Inline assets < 4kb
    },
    // Optimización de dependencias
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion'],
    },
  }
});
