import PhoneFrame from './components/PhoneFrame'
import DiscoverScreen from './components/DiscoverScreen'
import CrushesScreen from './components/CrushesScreen'
import ChatsScreen from './components/ChatsScreen'
import ChatThreadScreen from './components/ChatThreadScreen'
import MeScreen from './components/MeScreen'
import BottomNav from './components/BottomNav'
import ProfileDetail from './components/ProfileDetail'
import MatchModal from './components/MatchModal'
import { useJodiApp } from './useJodiApp'

export default function App() {
  const app = useJodiApp()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '40px 0 56px' }}>
      <PhoneFrame>
        <DiscoverScreen app={app} />
        <CrushesScreen app={app} />
        <ChatsScreen app={app} />
        <ChatThreadScreen app={app} />
        <MeScreen app={app} />
        <BottomNav app={app} />
        <ProfileDetail app={app} />
        <MatchModal app={app} />
      </PhoneFrame>
    </div>
  )
}
