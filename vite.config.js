import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 9969
  },
  preview: {
    port: 9969
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  base: '/'
});