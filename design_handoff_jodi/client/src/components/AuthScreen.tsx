import { useState, type CSSProperties, type FormEvent } from 'react'
import { useAuth } from '../AuthContext'

const inputStyle: CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #201812',
  background: '#FFFDF7', fontSize: 14.5, color: '#201812', outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif",
}
const labelStyle: CSSProperties = { fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 5, display: 'block' }

function maxBirthdate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

export default function AuthScreen() {
  const { signup, login, error, clearError } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') await login(email, password)
      else await signup({ name, email, password, birthdate })
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="jScroll" style={{ position: 'absolute', inset: 0, paddingTop: 64, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 17, height: 17, borderRadius: '50%', background: '#E5326E' }} />
          <span style={{ width: 17, height: 17, borderRadius: '50%', background: '#F5A524', marginLeft: -7, mixBlendMode: 'multiply' }} />
        </div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 26, color: '#201812', letterSpacing: '-1px', marginTop: 8 }}>
          {mode === 'login' ? 'welcome back' : 'join jodi'}
        </div>
        <div style={{ fontSize: 12.5, color: '#8A7C68', marginTop: 4 }}>
          {mode === 'login' ? 'no endless scroll. just five, every day.' : 'desi dating · five a day · you have to be 18+'}
        </div>
      </div>

      <form onSubmit={submit} style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'signup' && (
          <div>
            <label style={labelStyle}>name</label>
            <input data-testid="auth-name" style={inputStyle} value={name} onChange={e => setName(e.target.value)} required maxLength={60} placeholder="what should we call you?" />
          </div>
        )}
        <div>
          <label style={labelStyle}>email</label>
          <input data-testid="auth-email" style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div>
          <label style={labelStyle}>password</label>
          <input data-testid="auth-password" style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="at least 8 characters" />
        </div>
        {mode === 'signup' && (
          <div>
            <label style={labelStyle}>birthdate</label>
            <input data-testid="auth-birthdate" style={inputStyle} type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} required max={maxBirthdate()} />
            <div style={{ fontSize: 10.5, color: '#8A7C68', marginTop: 4 }}>you must be 18+ to use jodi</div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fdeef3', border: '2px solid #E5326E', borderRadius: 14, padding: '10px 13px', fontSize: 12.5, color: '#8E1247' }}>{error}</div>
        )}

        <button
          data-testid="auth-submit"
          type="submit"
          disabled={submitting}
          style={{ marginTop: 4, padding: 14, borderRadius: 26, background: '#E5326E', border: '2px solid #201812', boxShadow: '3px 3px 0 #201812', color: '#fff', fontSize: 15, fontWeight: 800, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'one sec…' : mode === 'login' ? 'log in' : 'create account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: '#8A7C68' }}>
        {mode === 'login' ? "new here?" : 'already have an account?'}{' '}
        <span
          data-testid="auth-toggle-mode"
          onClick={() => { clearError(); setMode(mode === 'login' ? 'signup' : 'login') }}
          style={{ color: '#E5326E', fontWeight: 700, cursor: 'pointer' }}
        >
          {mode === 'login' ? 'create an account' : 'log in'}
        </span>
      </div>

      {mode === 'login' && (
        <div style={{ margin: '20px 24px 0', padding: '12px 14px', borderRadius: 14, border: '2px dashed rgba(32,24,18,.24)', fontSize: 11.5, color: '#8A7C68', lineHeight: 1.5 }}>
          demo accounts: <strong>aisha@demo.jodi</strong>…<strong>sana@demo.jodi</strong>, password <strong>password123</strong>
        </div>
      )}
    </div>
  )
}
