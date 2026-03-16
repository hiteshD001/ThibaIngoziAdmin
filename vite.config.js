import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.xlsx'],
  plugins: [react()],
  build: {
    target: 'es2020',
  },
  server: {
    port: 5001, // Set your desired port
    host: true, // Makes the server accessible on your VM's public IP
  }
})
