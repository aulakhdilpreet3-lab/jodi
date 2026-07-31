import { useAuth } from './AuthContext'
import PhoneFrame from './components/PhoneFrame'
import AuthScreen from './components/AuthScreen'
import LoggedInApp from './LoggedInApp'

export default function App() {
  const { status } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '40px 0 56px' }}>
      <PhoneFrame>
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#8A7C68' }}>loading…</div>
        )}
        {status === 'anon' && <AuthScreen />}
        {status === 'authed' && <LoggedInApp />}
      </PhoneFrame>
    </div>
  )
}
