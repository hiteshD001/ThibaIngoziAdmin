import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  assetsInclude: ['**/*.xlsx'],
  plugins: [react()],
  build: {
    target: 'es2020',
  },
  server: {
    port: 5001,
    host: true,
  },
})