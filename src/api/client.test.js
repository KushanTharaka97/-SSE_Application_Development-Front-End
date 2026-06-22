import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from './client'

describe('API client', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => vi.unstubAllGlobals())

  it('unwraps the standard backend success envelope', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({ status: 200, message: 'OK', data: { id: 7 } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    await expect(api('/api/example')).resolves.toEqual({ id: 7 })
  })

  it('adds the JWT bearer token when authenticated', async () => {
    sessionStorage.setItem('gsrp_token', 'test-token')
    fetch.mockResolvedValue(new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    await api('/api/example')
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer test-token')
  })

  it('normalizes backend errors', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({ message: 'Access is denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }))
    await expect(api('/api/private')).rejects.toEqual(expect.objectContaining({
      name: 'ApiError', status: 403, message: 'Access is denied',
    }))
    expect(ApiError).toBeTypeOf('function')
  })
})
