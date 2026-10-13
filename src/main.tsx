import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PwaProvider } from './pwa/PwaProvider'
import './styles/app.css'

const AppBootstrap = lazy(() => import('./AppBootstrap'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="page-state loading-state" role="status">Loading BulkText…</div>}>
          <AppBootstrap />
        </Suspense>
      </BrowserRouter>
    </PwaProvider>
  </StrictMode>,
)
