import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.xlsx'],
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react/') && !id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('@mui/') || id.includes('@emotion/')) {
              return 'mui'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('@mui/x-charts')) {
              return 'charts'
            }
            if (id.includes('@react-google-maps') || id.includes('@googlemaps/markerclusterer')) {
              return 'maps'
            }
          }
        },
      },
    },
  },
  server: {
    port: 5001, // Set your desired port
    host: true, // Makes the server accessible on your VM's public IP
  }
})

