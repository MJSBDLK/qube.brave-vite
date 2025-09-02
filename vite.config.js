import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // IPFS relative paths
  build: {
    outDir: 'out',  // Match current IPFS workflow
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined // Simpler bundling
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001' // Future backend integration
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})
