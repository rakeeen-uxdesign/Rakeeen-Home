import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { applyStoredTheme } from '@/lib/theme'

// Before the first paint, so a refresh on any page keeps the theme (only Home used to apply it).
applyStoredTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
