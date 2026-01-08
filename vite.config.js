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
    host: true, // Bind to all interfaces (IPv4 + IPv6)
    proxy: {
      '/api': 'http://localhost:3010' // Bug report API
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})
