import React from 'react'
import { logInfo } from './logger'

export default function App() {
  logInfo('Frontend app render')
  return (
    <div style={{ padding: 24 }}>
      <h1>Frontend_Node</h1>
      <p>Vite + React scaffold</p>
    </div>
  )
}
