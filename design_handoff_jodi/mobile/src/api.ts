import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'jodi.token'

// Set EXPO_PUBLIC_API_URL to your deployed server for a production build.
// Falls back to localhost for the iOS simulator, which shares the host's
// network — a physical device or Android emulator needs your machine's LAN
// IP instead (e.g. http://192.168.1.20:4000) when running against a local
// dev server.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token)
  else await AsyncStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function toUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_URL}${path}`
}

async function request<T>(method: string, path: string, body?: unknown, isForm = false): Promise<T> {
  const headers: Record<string, string> = {}
  const token = await getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(toUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    throw new ApiError(res.status, (data && data.error) || `request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  del: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, form, true),
}

export function mediaUrl(path: string | null): string | null {
  if (!path) return null
  return path.startsWith('http') ? path : `${API_URL}${path}`
}
