import { Bell, Building2, ClipboardList, HeartPulse, LogOut, Menu, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ROLES, pretty } from '../constants'
import { healthApi } from '../api/client'

const navByRole = {
  [ROLES.CITIZEN]: [
    { to: '/requests', label: 'My requests', icon: ClipboardList },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ],
  [ROLES.SERVICE_AGENT]: [{ to: '/requests', label: 'Request workspace', icon: ClipboardList }],
  [ROLES.ADMIN]: [
    { to: '/requests', label: 'Service requests', icon: ClipboardList },
    { to: '/citizens', label: 'Citizens', icon: Users },
  ],
}

export function AppShell({ children }) {
  const { user, role, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [online, setOnline] = useState(null)
  useEffect(() => {
    healthApi.check().then((result) => setOnline(result?.status === 'UP')).catch(() => setOnline(false))
  }, [])
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Building2 /></span><div><strong>GovConnect</strong><small>Public services portal</small></div></div>
      <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
      <nav aria-label="Primary navigation">{navByRole[role]?.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className={`system-state ${online === false ? 'system-state--down' : ''}`}><HeartPulse size={18} /><span><strong>{online === null ? 'Checking service' : online ? 'Service online' : 'Service unavailable'}</strong><small>{online === false ? 'Check backend connection' : 'Secure government network'}</small></span></div>
      <div className="user-card"><div className="avatar">{user?.username?.slice(0, 2).toUpperCase()}</div><div><strong>{user?.username}</strong><small>{pretty(role)}</small></div><button onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    </aside>
    <div className="app-main"><header className="mobile-header"><button onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button><strong>GovConnect</strong></header><main>{children}</main></div>
  </div>
}

export function PageHeader({ eyebrow, title, description, action }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>
}
