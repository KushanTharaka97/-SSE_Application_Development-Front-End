const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export async function api(path, options = {}) {
  const token = sessionStorage.getItem('gsrp_token')
  const isFormData = options.body instanceof FormData
  const headers = new Headers(options.headers)
  if (!isFormData && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

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
    const rawMessage = payload?.message
    const message = typeof rawMessage === 'object'
      ? Object.values(rawMessage).join('. ')
      : rawMessage || `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, payload)
  }
  return payload?.data ?? payload
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
}

export const notificationApi = {
  mine: () => api('/api/notifications/my'),
  markRead: (id) => api(`/api/notifications/${id}/read`, { method: 'PATCH' }),
}

export const healthApi = { check: () => api('/actuator/health') }
