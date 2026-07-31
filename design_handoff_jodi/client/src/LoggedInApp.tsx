import BottomNav from './components/BottomNav'
import ChatsScreen from './components/ChatsScreen'
import ChatThreadScreen from './components/ChatThreadScreen'
import CrushesScreen from './components/CrushesScreen'
import DiscoverScreen from './components/DiscoverScreen'
import MatchModal from './components/MatchModal'
import MeScreen from './components/MeScreen'
import ProfileDetail from './components/ProfileDetail'
import { useJodiApp } from './useJodiApp'

export default function LoggedInApp() {
  const app = useJodiApp()

  return (
    <>
      <DiscoverScreen app={app} />
      <CrushesScreen app={app} />
      <ChatsScreen app={app} />
      <ChatThreadScreen app={app} />
      <MeScreen app={app} />
      <BottomNav app={app} />
      <ProfileDetail app={app} />
      <MatchModal app={app} />
    </>
  )
}
