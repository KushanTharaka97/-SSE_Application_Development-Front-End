export const ROLES = { CITIZEN: 'CITIZEN', SERVICE_AGENT: 'SERVICE_AGENT', ADMIN: 'ADMIN' }
export const SERVICE_TYPES = ['GENERAL_INQUIRY', 'DOCUMENT_RENEWAL']
export const REQUEST_STATUSES = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED']
export const DOCUMENT_TYPES = ['IDENTIFICATION', 'PROOF_OF_ADDRESS', 'SUPPORTING_LETTER', 'OTHER']
export const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED']
export const CITIZEN_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION']

export const pretty = (value = '') => {
  const normalized = value == null ? '' : String(value)
  return normalized.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
export const formatDate = (value) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
