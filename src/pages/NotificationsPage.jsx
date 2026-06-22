import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationApi } from '../api/client'
import { PageHeader } from '../components/AppShell'
import { Alert, Button, EmptyState, SkeletonRows, StatusBadge } from '../components/ui'
import { formatDate, pretty } from '../constants'

export function NotificationsPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = () => { setLoading(true); notificationApi.mine().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false)) }
  useEffect(load, [])
  const markRead = async (id) => { try { const updated = await notificationApi.markRead(id); setItems((all) => all.map((item) => item.id === id ? updated : item)) } catch (e) { setError(e.message) } }
  return <><PageHeader eyebrow="Citizen portal" title="Notifications" description="Updates about your submitted government service requests." />{error && <Alert onClose={() => setError('')}>{error}</Alert>}
    <section className="panel"><div className="panel-heading"><div><h2>Recent updates</h2><p>{items.filter((item) => item.status === 'UNREAD').length} unread notifications</p></div></div>
      {loading ? <SkeletonRows /> : !items.length ? <EmptyState icon={Bell} title="No notifications yet" text="Status updates will appear here." /> : <div className="notification-list">{items.map((item) => <article className={item.status === 'UNREAD' ? 'notification notification--unread' : 'notification'} key={item.id}><span className="notification-icon"><Bell /></span><div><div className="notification-title"><strong>{pretty(item.serviceType)}</strong><StatusBadge value={item.serviceRequestStatus} /></div><p>{item.message}</p><small>{formatDate(item.createdDate)} · Request #{item.serviceRequestId}</small></div>{item.status === 'UNREAD' && <Button variant="ghost" onClick={() => markRead(item.id)}><CheckCheck size={17} />Mark read</Button>}</article>)}</div>}
    </section></>
}
