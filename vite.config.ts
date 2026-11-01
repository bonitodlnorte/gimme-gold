/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      // Mirrors the partner manifest rewrite in vercel.json during development.
      name: 'partner-manifest',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (/^\/pareja\/[^/]+\/manifest\.webmanifest$/.test(req.url ?? '')) req.url = '/manifest-pareja.json'
          next()
        })
      },
    },
  ],
  test: {
    environment: 'node',
  },
})
