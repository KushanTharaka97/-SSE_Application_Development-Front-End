import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { pretty } from '../constants'

export function Button({ variant = 'primary', loading = false, children, ...props }) {
  return <button className={`button button--${variant}`} disabled={loading || props.disabled} {...props}>
    {loading && <LoaderCircle size={17} className="spin" />}{children}
  </button>
}

export function Field({ label, error, hint, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>
}

export function StatusBadge({ value }) {
  return <span className={`badge badge--${String(value).toLowerCase()}`}>{pretty(value)}</span>
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return <div className="empty-state">{Icon && <Icon size={30} />}<h3>{title}</h3><p>{text}</p>{action}</div>
}

export function Alert({ type = 'error', children, onClose }) {
  return <div className={`alert alert--${type}`} role="alert">
    {type === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
    <span>{children}</span>{onClose && <button onClick={onClose} aria-label="Dismiss"><X size={16} /></button>}
  </div>
}

export function Modal({ title, description, onClose, children, wide = false }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></header>
      {children}
    </section>
  </div>
}

export function Pagination({ page, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null
  return <div className="pagination"><Button variant="secondary" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</Button><span>Page {page + 1} of {totalPages}</span><Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next</Button></div>
}

export function SkeletonRows({ count = 4 }) {
  return <div className="skeleton-list">{Array.from({ length: count }, (_, i) => <div className="skeleton" key={i} />)}</div>
}
