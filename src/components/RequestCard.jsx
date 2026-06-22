import { ArrowRight, CalendarDays, UserRound } from 'lucide-react'
import { formatDate, pretty } from '../constants'
import { StatusBadge } from './ui'

export function RequestCard({ request, onOpen }) {
  return <article className="request-card" tabIndex="0" onClick={() => onOpen(request)} onKeyDown={(e) => e.key === 'Enter' && onOpen(request)}>
    <div className="request-card__top"><span className="request-id">REQ-{String(request.id).padStart(5, '0')}</span><StatusBadge value={request.status} /></div>
    <h3>{pretty(request.serviceType)}</h3><p>{request.description}</p>
    <footer>{request.citizenName && <span><UserRound size={15} />{request.citizenName}</span>}<span><CalendarDays size={15} />{formatDate(request.createdDate)}</span><ArrowRight className="request-arrow" size={18} /></footer>
  </article>
}
