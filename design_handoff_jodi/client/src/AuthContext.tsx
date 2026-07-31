import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ApiError, api, getToken, setToken } from './api'
import { connectSocket, disconnectSocket } from './socket'
import type { MeUser } from './types'

interface SignupPayload {
  name: string
  email: string
  password: string
  birthdate: string
}

interface AuthContextValue {
  user: MeUser | null
  status: 'loading' | 'authed' | 'anon'
  error: string | null
  signup: (p: SignupPayload) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  deleteAccount: () => Promise<void>
  setUser: (u: MeUser) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<MeUser | null>(null)
  const [status, setStatus] = useState<'loading' | 'authed' | 'anon'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) { setStatus('anon'); return }
    api.get<{ user: MeUser }>('/api/auth/me')
      .then(({ user }) => { setUserState(user); setStatus('authed'); connectSocket() })
      .catch(() => { setToken(null); setStatus('anon') })
  }, [])

  const signup = async (p: SignupPayload) => {
    setError(null)
    try {
      const { token, user } = await api.post<{ token: string; user: MeUser }>('/api/auth/signup', p)
      setToken(token)
      setUserState(user)
      setStatus('authed')
      connectSocket()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'signup failed')
      throw e
    }
  }

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const { token, user } = await api.post<{ token: string; user: MeUser }>('/api/auth/login', { email, password })
      setToken(token)
      setUserState(user)
      setStatus('authed')
      connectSocket()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'login failed')
      throw e
    }
  }

  const logout = () => {
    setToken(null)
    setUserState(null)
    setStatus('anon')
    disconnectSocket()
  }

  const deleteAccount = async () => {
    await api.del('/api/auth/me')
    logout()
  }

  return (
    <AuthContext.Provider value={{ user, status, error, signup, login, logout, deleteAccount, setUser: setUserState, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
