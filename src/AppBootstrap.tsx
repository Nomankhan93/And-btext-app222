import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { WorkspaceProvider } from './workspace/WorkspaceProvider'

export default function AppBootstrap() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </AuthProvider>
  )
}
