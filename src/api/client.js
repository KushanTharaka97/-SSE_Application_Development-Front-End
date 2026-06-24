const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const buildHeaders = (options = {}) => {
  const token = sessionStorage.getItem('gsrp_token')
  const isFormData = options.body instanceof FormData
  const headers = new Headers(options.headers)
  if (!isFormData && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

const getErrorMessage = (payload, status) => {
  const rawMessage = payload?.message
  return typeof rawMessage === 'object'
    ? Object.values(rawMessage).join('. ')
    : rawMessage || `Request failed with status ${status}`
}

const parseFileName = (contentDisposition) => {
  if (!contentDisposition) return ''
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match) return decodeURIComponent(utf8Match[1])
  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i)
  if (quotedMatch) return quotedMatch[1]
  const plainMatch = contentDisposition.match(/filename=([^;]+)/i)
  return plainMatch ? plainMatch[1].trim() : ''
}

const openBlobUrl = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob)
  const popup = window.open(objectUrl, '_blank', 'noopener,noreferrer')
  if (!popup) {
    URL.revokeObjectURL(objectUrl)
    throw new ApiError(`Popup blocked while opening ${fileName || 'the document'}.`, 0)
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}

const downloadBlob = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName || 'supporting-document'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

export async function api(path, options = {}) {
  const headers = buildHeaders(options)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Cannot reach the government service API. Confirm the backend is running.', 0)
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('gsrp:unauthorized'))
    const message = getErrorMessage(payload, response.status)
    throw new ApiError(message, response.status, payload)
  }
  return payload?.data ?? payload
}

async function fetchFile(path) {
  const headers = buildHeaders()

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers })
  } catch {
    throw new ApiError('Cannot reach the government service API. Confirm the backend is running.', 0)
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : null
    if (response.status === 401) window.dispatchEvent(new Event('gsrp:unauthorized'))
    throw new ApiError(getErrorMessage(payload, response.status), response.status, payload)
  }

  return {
    blob: await response.blob(),
    fileName: parseFileName(response.headers.get('content-disposition')),
  }
}

const json = (body) => JSON.stringify(body)

export const authApi = {
  login: (body) => api('/api/auth/login', { method: 'POST', body: json(body) }),
  register: (body) => api('/api/auth/register', { method: 'POST', body: json(body) }),
  me: () => api('/api/auth/me'),
  adminRegister: (body) => api('/api/auth/admin/register', { method: 'POST', body: json(body) }),
}

export const citizenApi = {
  list: ({ query = '', page = 0, size = 10 } = {}) => api(`/api/citizens?query=${encodeURIComponent(query)}&page=${page}&size=${size}`),
  get: (id) => api(`/api/citizens/${id}`),
  create: (body) => api('/api/citizens', { method: 'POST', body: json(body) }),
  update: (id, body) => api(`/api/citizens/${id}`, { method: 'PUT', body: json(body) }),
  deactivate: (id) => api(`/api/citizens/${id}`, { method: 'DELETE' }),
}

export const requestApi = {
  mine: (page = 0, size = 10) => api(`/api/service-requests/my?page=${page}&size=${size}`),
  list: ({ citizenId = '', status = '', serviceType = '', page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams({ page, size })
    if (citizenId) params.set('citizenId', citizenId)
    if (status) params.set('status', status)
    if (serviceType) params.set('serviceType', serviceType)
    return api(`/api/service-requests?${params}`)
  },
  get: (id) => api(`/api/service-requests/${id}`),
  submit: (body) => api('/api/service-requests', { method: 'POST', body: json(body) }),
  update: (id, body) => api(`/api/service-requests/${id}`, { method: 'PUT', body: json(body) }),
  updateStatus: (id, status) => api(`/api/service-requests/${id}/status`, { method: 'PATCH', body: json({ status }) }),
  cancel: (id) => api(`/api/service-requests/${id}`, { method: 'DELETE' }),
  documents: (id) => api(`/api/service-requests/${id}/documents`),
  history: (id) => api(`/api/service-requests/${id}/history`),
}

export const documentApi = {
  upload: (formData) => api('/api/documents', { method: 'POST', body: formData }),
  get: (id) => api(`/api/documents/${id}`),
  update: (id, body) => api(`/api/documents/${id}`, { method: 'PUT', body: json(body) }),
  verify: (id, verificationStatus) => api(`/api/documents/${id}`, { method: 'PATCH', body: json({ verificationStatus }) }),
  remove: (id) => api(`/api/documents/${id}`, { method: 'DELETE' }),
  viewFile: async (id) => {
    const { blob, fileName } = await fetchFile(`/api/documents/${id}/file`)
    openBlobUrl(blob, fileName)
  },
  downloadFile: async (id) => {
    const { blob, fileName } = await fetchFile(`/api/documents/${id}/file`)
    downloadBlob(blob, fileName)
  },
}

export const notificationApi = {
  mine: () => api('/api/notifications/my'),
  markRead: (id) => api(`/api/notifications/${id}/read`, { method: 'PATCH' }),
}

export const healthApi = { check: () => api('/actuator/health') }
