import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// initialize JSX logger BEFORE importing App so component modules can call window.__jsx_log during evaluation
import { initPageLogger } from './utils/apiLogger.js'
// Initialize SPA page logger (controlled by VITE_API_LOG)
initPageLogger();
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
