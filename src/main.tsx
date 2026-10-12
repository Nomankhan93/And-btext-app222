import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { WorkspaceProvider } from './workspace/WorkspaceProvider'
import { PwaProvider } from './pwa/PwaProvider'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaProvider>
      <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </AuthProvider>
      </BrowserRouter>
    </PwaProvider>
  </StrictMode>,
)
