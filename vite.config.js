import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // For GitHub Pages: production build is served from /minecraft-ui-builder/
  // Dev server keeps using root '/' for convenience.
  base: command === 'build' ? '/minecraft-ui-builder/' : '/',
}))
