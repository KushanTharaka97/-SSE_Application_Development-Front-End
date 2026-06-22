import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { ROLES } from './constants'
import { AuthPage } from './pages/AuthPage'
import { CitizensPage } from './pages/CitizensPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { RequestsPage } from './pages/RequestsPage'

function Protected({ roles, children }) {
  const { user, role, initializing } = useAuth()
  if (initializing) return <div className="app-loading"><span className="brand-mark">G</span><p>Securing your session…</p></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/requests" replace />
  return <AppShell>{children}</AppShell>
}

export function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/requests" element={<Protected><RequestsPage /></Protected>} />
    <Route path="/notifications" element={<Protected roles={[ROLES.CITIZEN]}><NotificationsPage /></Protected>} />
    <Route path="/citizens" element={<Protected roles={[ROLES.ADMIN]}><CitizensPage /></Protected>} />
    <Route path="*" element={<Navigate to="/requests" replace />} />
  </Routes>
}
