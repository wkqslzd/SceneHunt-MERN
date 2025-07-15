import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

console.log('VITE CONFIG LOADED!');

// Read the back-end port
function getBackendPort() {
  try {
    const portFile = path.resolve(__dirname, '../backend/port.txt')
    if (fs.existsSync(portFile)) {
      return fs.readFileSync(portFile, 'utf-8').trim()
    }
  } catch (error) {
    console.error('Error reading port file:', error)
  }
  return '5000' // Default port
}

// Get the back-end URL
const backendUrl = `http://localhost:${getBackendPort()}`
console.log('Vite will proxy /api to:', backendUrl);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backendUrl,  // Use the back-end URL dynamically obtained
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    hmr: {
      overlay: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    'process.env.VITE_BACKEND_URL': JSON.stringify(backendUrl)
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
