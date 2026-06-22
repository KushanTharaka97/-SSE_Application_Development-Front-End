import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, FileUp, Filter, Plus, Search, Trash2 } from 'lucide-react'
import { citizenApi, documentApi, requestApi } from '../api/client'
import { PageHeader } from '../components/AppShell'
import { RequestCard } from '../components/RequestCard'
import { Alert, Button, EmptyState, Field, Modal, Pagination, SkeletonRows, StatusBadge } from '../components/ui'
import { DOCUMENT_TYPES, formatDate, pretty, REQUEST_STATUSES, ROLES, SERVICE_TYPES, VERIFICATION_STATUSES } from '../constants'
import { useAuth } from '../context/AuthContext'

const emptyRequest = { serviceType: 'GENERAL_INQUIRY', description: '', citizenId: '' }

function RequestForm({ initial = emptyRequest, admin, onSubmit, onClose }) {
  const [form, setForm] = useState({ ...emptyRequest, ...initial }); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const submit = async (e) => { e.preventDefault(); setBusy(true); setError(''); try { await onSubmit({ ...form, citizenId: admin && form.citizenId ? Number(form.citizenId) : null }); onClose() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <form className="form-grid" onSubmit={submit}>{error && <div className="span-2"><Alert>{error}</Alert></div>}
    <Field label="Service type"><select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>{SERVICE_TYPES.map((type) => <option key={type} value={type}>{pretty(type)}</option>)}</select></Field>
    {admin && <Field label="Citizen ID" hint="Required when submitting on behalf of a citizen"><input type="number" min="1" required value={form.citizenId} onChange={(e) => setForm({ ...form, citizenId: e.target.value })} /></Field>}
    <Field label="Request description"><textarea required maxLength="1000" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the service you need and include relevant details." /><small>{form.description.length}/1000</small></Field>
    <div className="form-actions span-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>Save request</Button></div>
  </form>
}

function UploadForm({ requestId, onClose }) {
  const [form, setForm] = useState({ type: 'IDENTIFICATION', name: '', file: null }); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const submit = async (e) => { e.preventDefault(); setBusy(true); setError(''); const body = new FormData(); body.append('file', form.file); body.append('serviceRequestId', requestId); body.append('type', form.type); body.append('name', form.name); try { await documentApi.upload(body); onClose() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <form className="form-grid" onSubmit={submit}>{error && <div className="span-2"><Alert>{error}</Alert></div>}<Field label="Document type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{pretty(type)}</option>)}</select></Field><Field label="Display name"><input required maxLength="255" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. National ID front" /></Field><Field label="Choose file" hint="Backend limit: 10 MB per file"><input type="file" required onChange={(e) => setForm({ ...form, file: e.target.files[0] })} /></Field><div className="form-actions span-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy}>Upload securely</Button></div></form>
}

function DocumentEditor({ document, onSaved }) {
  const [form, setForm] = useState(document); const [editing, setEditing] = useState(false); const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const updated = await documentApi.update(document.id, {
        type: form.type, name: form.name, documentReference: form.documentReference,
        verificationStatus: form.verificationStatus,
      })
      onSaved(updated); setEditing(false)
    } finally { setBusy(false) }
  }
  if (!editing) return <div><div><strong>{document.name}</strong><small>{pretty(document.type)} · Ref: {document.documentReference}</small></div><div className="document-actions"><StatusBadge value={document.verificationStatus} /><Button variant="ghost" onClick={async () => { const current = await documentApi.get(document.id); setForm(current); setEditing(true) }}>Edit</Button></div></div>
  return <div className="document-edit"><Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{pretty(type)}</option>)}</select></Field><Field label="Reference"><input value={form.documentReference} onChange={(e) => setForm({ ...form, documentReference: e.target.value })} /></Field><Field label="Verification"><select value={form.verificationStatus} onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}>{VERIFICATION_STATUSES.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select></Field><div className="document-actions"><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></div></div>
}

function RequestDetail({ request, role, onClose, onChanged }) {
  const [data, setData] = useState(request); const [draft, setDraft] = useState(request); const [citizenProfile, setCitizenProfile] = useState(null); const [documents, setDocuments] = useState([]); const [history, setHistory] = useState([]); const [error, setError] = useState(''); const [upload, setUpload] = useState(false); const agent = role === ROLES.SERVICE_AGENT
  useEffect(() => { requestApi.get(request.id).then((value) => { setData(value); setDraft(value) }).catch((e) => setError(e.message)); if (agent) Promise.all([requestApi.documents(request.id), requestApi.history(request.id), citizenApi.get(request.citizenId)]).then(([docs, events, profile]) => { setDocuments(docs); setHistory(events); setCitizenProfile(profile) }).catch((e) => setError(e.message)) }, [request.id, request.citizenId, agent])
  const changeStatus = async (status) => { try { const updated = await requestApi.updateStatus(data.id, status); setData(updated); onChanged() } catch (e) { setError(e.message) } }
  const saveDetails = async () => { try { const updated = await requestApi.update(data.id, { serviceType: draft.serviceType, description: draft.description, citizenId: data.citizenId }); setData(updated); setDraft(updated); onChanged() } catch (e) { setError(e.message) } }
  return <Modal wide title={`Request REQ-${String(data.id).padStart(5, '0')}`} description={pretty(data.serviceType)} onClose={onClose}>{error && <Alert onClose={() => setError('')}>{error}</Alert>}
    <div className="detail-grid"><div><span className="detail-label">Status</span><StatusBadge value={data.status} /></div><div><span className="detail-label">Citizen</span><strong>{data.citizenName || `Citizen #${data.citizenId}`}</strong></div><div><span className="detail-label">Submitted</span><strong>{formatDate(data.createdDate)}</strong></div></div>
    {agent && citizenProfile && <div className="detail-section"><h3>Citizen contact</h3><p>{citizenProfile.email} · {citizenProfile.mobile}<br />{citizenProfile.address}</p></div>}
    {(agent || role === ROLES.ADMIN) ? <div className="detail-section"><h3>Request details</h3><div className="form-grid"><Field label="Service type"><select value={draft.serviceType} onChange={(e) => setDraft({ ...draft, serviceType: e.target.value })}>{SERVICE_TYPES.map((type) => <option key={type} value={type}>{pretty(type)}</option>)}</select></Field><Field label="Description"><textarea rows="3" maxLength="1000" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field><div className="form-actions span-2"><Button variant="secondary" onClick={saveDetails}>Save details</Button></div></div></div> : <div className="detail-section"><h3>Description</h3><p>{data.description}</p></div>}
    {(agent || role === ROLES.ADMIN) && <div className="detail-section"><h3>Process request</h3><div className="inline-controls"><select aria-label="New request status" value={data.status} onChange={(e) => changeStatus(e.target.value)}>{REQUEST_STATUSES.filter((s) => s !== 'CANCELLED').map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select></div></div>}
    {role === ROLES.CITIZEN && <div className="detail-section"><Button onClick={() => setUpload(true)}><FileUp size={17} />Upload supporting document</Button></div>}
    {agent && <><div className="detail-section"><h3>Supporting documents</h3>{!documents.length ? <p className="muted">No documents attached.</p> : <div className="document-list">{documents.map((doc) => <DocumentEditor key={doc.id} document={doc} onSaved={(updated) => setDocuments((all) => all.map((item) => item.id === updated.id ? updated : item))} />)}</div>}</div>
      <div className="detail-section"><h3>Status history</h3>{!history.length ? <p className="muted">No status changes recorded.</p> : <ol className="timeline">{history.map((event) => <li key={event.id}><span /><div><strong>{pretty(event.previousStatus)} → {pretty(event.newStatus)}</strong><small>{formatDate(event.changedAt)} by {event.changedBy}</small></div></li>)}</ol>}</div></>}
    {upload && <Modal title="Upload supporting document" description={`Attach a file to request #${data.id}`} onClose={() => setUpload(false)}><UploadForm requestId={data.id} onClose={() => setUpload(false)} /></Modal>}
  </Modal>
}

export function RequestsPage() {
  const { role } = useAuth(); const citizen = role === ROLES.CITIZEN; const admin = role === ROLES.ADMIN
  const [result, setResult] = useState({ content: [], number: 0, totalPages: 0, totalElements: 0 }); const [filters, setFilters] = useState({ citizenId: '', status: '', serviceType: '', page: 0, size: 9 }); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [formOpen, setFormOpen] = useState(false); const [selected, setSelected] = useState(null)
  const load = useCallback(() => { setLoading(true); setError(''); const call = citizen ? requestApi.mine(filters.page, filters.size) : requestApi.list(filters); call.then(setResult).catch((e) => setError(e.message)).finally(() => setLoading(false)) }, [citizen, filters])
  useEffect(load, [load])
  const cancel = async (id) => { if (!window.confirm(`Cancel request #${id}? This action changes its status to CANCELLED.`)) return; try { await requestApi.cancel(id); load() } catch (e) { setError(e.message) } }
  return <><PageHeader eyebrow={citizen ? 'Citizen portal' : admin ? 'Administration' : 'Service agent workspace'} title={citizen ? 'My service requests' : 'Service requests'} description={citizen ? 'Submit and track requests across government services.' : 'Review, filter and process incoming citizen requests.'} action={(citizen || admin) && <Button onClick={() => setFormOpen(true)}><Plus size={18} />New request</Button>} />
    {error && <Alert onClose={() => setError('')}>{error}</Alert>}
    {!citizen && <section className="filter-bar"><Filter size={18} /><Field label="Citizen ID"><input type="number" min="1" value={filters.citizenId} onChange={(e) => setFilters({ ...filters, citizenId: e.target.value, page: 0 })} placeholder="Any citizen" /></Field><Field label="Status"><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}><option value="">All statuses</option>{REQUEST_STATUSES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}</select></Field><Field label="Service"><select value={filters.serviceType} onChange={(e) => setFilters({ ...filters, serviceType: e.target.value, page: 0 })}><option value="">All services</option>{SERVICE_TYPES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}</select></Field></section>}
    <section className="panel"><div className="panel-heading"><div><h2>{citizen ? 'Your applications' : 'Request queue'}</h2><p>{result.totalElements || 0} requests found</p></div><Search size={20} /></div>{loading ? <SkeletonRows count={5} /> : !result.content?.length ? <EmptyState icon={ClipboardList} title="No service requests found" text={citizen ? 'Start by submitting your first service request.' : 'Adjust the filters or check again later.'} action={citizen && <Button onClick={() => setFormOpen(true)}>Create a request</Button>} /> : <div className="request-grid">{result.content.map((item) => <div className="request-card-wrap" key={item.id}><RequestCard request={item} onOpen={setSelected} />{admin && item.status !== 'CANCELLED' && <button className="danger-float" onClick={() => cancel(item.id)} aria-label={`Cancel request ${item.id}`}><Trash2 size={16} /></button>}</div>)}</div>}<Pagination page={result.number || 0} totalPages={result.totalPages || 0} onChange={(page) => setFilters({ ...filters, page })} /></section>
    {formOpen && <Modal title="New service request" description={admin ? 'Submit a request on behalf of a citizen.' : 'Tell us which public service you need.'} onClose={() => setFormOpen(false)}><RequestForm admin={admin} onClose={() => setFormOpen(false)} onSubmit={async (body) => { await requestApi.submit(body); load() }} /></Modal>}
    {selected && <RequestDetail request={selected} role={role} onClose={() => setSelected(null)} onChanged={load} />}
  </>
}
