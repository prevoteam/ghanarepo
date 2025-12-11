import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/python/api': {
        target: 'https://gra-demo.proteantech.in',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
