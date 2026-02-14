import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose NodePath to client code as import.meta.env.NodePath by defining it at build time
  define: {
    'import.meta.env.NodePath': JSON.stringify(process.env.NodePath || 'http://localhost:3004')
  },
  resolve: {
    alias: {
      // Force all imports of react / react-dom to the frontend's copy
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': process.env.NodePath || 'http://localhost:3004'
    }
  }
})
