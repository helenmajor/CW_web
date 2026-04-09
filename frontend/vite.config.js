import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoRoot = path.resolve(__dirname, '..')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    fs: {
      allow: [repoRoot],
    },
  },
})
