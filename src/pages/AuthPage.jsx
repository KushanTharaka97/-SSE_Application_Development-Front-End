import { useState } from 'react'
import { Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Alert, Button, Field } from '../components/ui'

export function AuthPage() {
  const { user, login } = useAuth()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', name: '', nic: '', email: '', mobile: '', address: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  if (user) return <Navigate to="/requests" replace />

  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setNotice(null)
    try {
      if (mode === 'register') {
        await authApi.register({
          username: form.nic,
          name: form.name,
          nic: form.nic,
          email: form.email,
          mobile: form.mobile,
          address: form.address,
          password: form.password,
        })
        setMode('login')
        setForm({ username: form.nic, name: '', nic: '', email: '', mobile: '', address: '', password: '' })
        setNotice({ type: 'success', text: 'Citizen account created. Sign in with your NIC and password.' })
      } else await login({ username: form.username, password: form.password })
    } catch (error) { setNotice({ type: 'error', text: error.message }) }
    finally { setLoading(false) }
  }

  return <div className="auth-page">
    <section className="auth-story">
      <div className="brand brand--light"><span className="brand-mark"><Building2 /></span><div><strong>GovConnect</strong><small>Public services portal</small></div></div>
      <div className="auth-story__content"><span className="eyebrow eyebrow--light">Simple · Secure · Transparent</span><h1>Government services,<br />made easier.</h1><p>Submit requests, share documents and follow every update from one trusted place.</p>
        <ul><li><CheckCircle2 />Track service requests in real time</li><li><CheckCircle2 />Securely manage supporting documents</li><li><CheckCircle2 />Receive status notifications</li></ul>
      </div><p className="auth-footer">Government Service Request Platform · Authorized access only</p>
    </section>
    <main className="auth-form-wrap"><div className="auth-form">
      <span className="auth-icon"><ShieldCheck /></span><h2>{mode === 'login' ? 'Welcome back' : 'Create citizen account'}</h2><p>{mode === 'login' ? 'Sign in to continue to your service portal.' : 'Register for secure access to public services.'}</p>
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      <form onSubmit={submit}>
        {mode === 'login' ? <Field label="NIC / Username"><input name="username" required minLength="3" maxLength="50" value={form.username} onChange={update} autoComplete="username" placeholder="Enter your NIC" /></Field> : <>
          <Field label="Full name"><input name="name" required maxLength="100" value={form.name} onChange={update} autoComplete="name" placeholder="Enter your full name" /></Field>
          <Field label="NIC"><input name="nic" required minLength="3" maxLength="20" value={form.nic} onChange={update} autoComplete="username" placeholder="Enter your NIC" /></Field>
          <Field label="Email address"><input name="email" type="email" required maxLength="100" value={form.email} onChange={update} autoComplete="email" placeholder="name@example.com" /></Field>
          <Field label="Mobile number"><input name="mobile" required maxLength="15" value={form.mobile} onChange={update} autoComplete="tel" placeholder="07XXXXXXXX" /></Field>
          <Field label="Address"><input name="address" required maxLength="255" value={form.address} onChange={update} autoComplete="street-address" placeholder="Enter your address" /></Field>
        </>}
        <Field label="Password"><div className="password-field"><LockKeyhole size={18} /><input name="password" type={showPassword ? 'text' : 'password'} required minLength={mode === 'register' ? 6 : undefined} value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></Field>
        <Button type="submit" loading={loading}>{mode === 'login' ? 'Sign in securely' : 'Create account'}</Button>
      </form>
      <p className="auth-switch">{mode === 'login' ? 'New citizen?' : 'Already registered?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setNotice(null); setForm({ username: '', name: '', nic: '', email: '', mobile: '', address: '', password: '' }) }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
    </div></main>
  </div>
}
