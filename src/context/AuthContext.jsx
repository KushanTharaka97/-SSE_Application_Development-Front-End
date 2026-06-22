import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gsrp_user')) }
    catch { return null }
  })
  const [initializing, setInitializing] = useState(Boolean(sessionStorage.getItem('gsrp_token')))

  const logout = useCallback(() => {
    sessionStorage.removeItem('gsrp_token')
    sessionStorage.removeItem('gsrp_user')
    setUser(null)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('gsrp:unauthorized', handleUnauthorized)
    if (sessionStorage.getItem('gsrp_token')) {
      authApi.me().then((profile) => {
        setUser(profile)
        sessionStorage.setItem('gsrp_user', JSON.stringify(profile))
      }).catch(logout).finally(() => setInitializing(false))
    }
    return () => window.removeEventListener('gsrp:unauthorized', handleUnauthorized)
  }, [logout])

  const login = async (credentials) => {
    const profile = await authApi.login(credentials)
    sessionStorage.setItem('gsrp_token', profile.token)
    sessionStorage.setItem('gsrp_user', JSON.stringify(profile))
    setUser(profile)
    return profile
  }

  const normalizedRoles = user?.roles?.map((item) => item.replace('ROLE_', '')) || []
  const role = ['ADMIN', 'SERVICE_AGENT', 'CITIZEN'].find((item) => normalizedRoles.includes(item)) || null
  const value = useMemo(() => ({ user, role, initializing, login, logout }), [user, role, initializing, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
