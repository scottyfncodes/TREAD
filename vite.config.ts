import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * `base` is relative so the same build works at a GitHub Pages project path
 * (/TREAD/), at a site root, or from the home screen.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
