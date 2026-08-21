import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/predict-crop': 'http://127.0.0.1:8000',
      '/farm-analysis': 'http://127.0.0.1:8000',
      '/what-if': 'http://127.0.0.1:8000',
      '/predict-disease': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
      '/technical-details': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
      '/alerts': 'http://127.0.0.1:8000',
      '/farmer': 'http://127.0.0.1:8000',
    }
  }
})