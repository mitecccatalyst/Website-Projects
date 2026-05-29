import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['leaflet']
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
      output: {
        manualChunks: {
          leaflet: ['leaflet'],
          'react-leaflet': ['react-leaflet']
        }
      }
    }
  }
})
