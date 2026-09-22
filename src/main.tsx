import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { captureInstallPrompt, registerVunaWorker } from './lib/pwa'
import { hasDocument } from './lib/runtime'

if (hasDocument()) {
  captureInstallPrompt()
  registerVunaWorker()
}

const root = hasDocument() ? document.getElementById('root') : null
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
