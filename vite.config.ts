import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false, // Disable minification for easier debugging
    sourcemap: true
  },
  server: {
    port: 5173
  }
})