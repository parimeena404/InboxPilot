import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { AppLayout } from '@/components/layout'
import Landing from '@/pages/Landing'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Inbox from '@/pages/Inbox'
import EmailDetail from '@/pages/EmailDetail'
import ClientWorkspace from '@/pages/ClientWorkspace'
import Meetings from '@/pages/Meetings'
import ConnectedAccounts from '@/pages/ConnectedAccounts'
import Settings from '@/pages/Settings'
import AICopilot from '@/pages/AICopilot'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingComplete } = useStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function RoleRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'assistant' | 'client' }) {
  const { role } = useStore()
  if (role !== allowedRole) {
    return <Navigate to={role === 'client' ? '/client' : '/dashboard'} replace />
  }
  return <>{children}</>
}

export default function App() {
  const { isAuthenticated, onboardingComplete, role } = useStore()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          isAuthenticated && onboardingComplete
            ? <Navigate to={role === 'client' ? '/client' : '/dashboard'} replace />
            : <Landing />
        } />
        <Route path="/onboarding" element={
          isAuthenticated && onboardingComplete
            ? <Navigate to={role === 'client' ? '/client' : '/dashboard'} replace />
            : <Onboarding />
        } />

        {/* App routes with layout */}
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/email/:id" element={<EmailDetail />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/accounts" element={<ConnectedAccounts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-assistant" element={<AICopilot />} />
          <Route path="/client" element={<ClientWorkspace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
