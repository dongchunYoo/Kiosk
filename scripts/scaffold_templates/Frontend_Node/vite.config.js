import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT)
  const nodePath = env.NodePath

  if (!port) {
    throw new Error('PORT is required in .env (Frontend_Node/.env)')
  }
  if (!nodePath) {
    throw new Error('NodePath is required in .env (Frontend_Node/.env)')
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.NodePath': JSON.stringify(nodePath)
    },
    resolve: {
      alias: {
        react: path.resolve(__dirname, 'node_modules', 'react'),
        'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
      }
    },
    server: {
      host: '0.0.0.0',
      port,
      proxy: {
        '/api': nodePath
      }
    }
  }
})
