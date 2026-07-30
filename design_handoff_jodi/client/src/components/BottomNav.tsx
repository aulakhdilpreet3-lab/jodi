import type { JodiApp } from '../useJodiApp'

export default function BottomNav({ app }: { app: JodiApp }) {
  if (!app.showNav) return null

  const itemStyle = (bg: string) => ({
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3,
    cursor: 'pointer', flex: 1, background: bg, borderRadius: 16, padding: '6px 0 4px',
  })

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 74, background: 'rgba(251,243,228,.95)', backdropFilter: 'blur(16px)', boxShadow: '0 -1.5px 0 rgba(32,24,18,.1)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', padding: '9px 10px 0', gap: 6, zIndex: 35 }}>
      <div data-testid="nav-discover" onClick={app.goDiscover} style={itemStyle(app.navDiscoverBg)}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" stroke={app.navDiscover} strokeWidth="1.9" fill={app.navDiscoverFill} /></svg>
        <span style={{ fontSize: 10, color: app.navDiscover, fontWeight: app.navDiscoverW }}>today</span>
      </div>
      <div data-testid="nav-crushes" onClick={app.goLikes} style={{ ...itemStyle(app.navLikesBg), position: 'relative' }}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" stroke={app.navLikes} strokeWidth="1.9" fill={app.navLikesFill} strokeLinejoin="round" /></svg>
        <span style={{ fontSize: 10, color: app.navLikes, fontWeight: app.navLikesW }}>crushes</span>
        <div style={{ position: 'absolute', top: -1, right: 'calc(50% - 22px)', background: '#E5326E', border: '1.5px solid #201812', color: '#fff', fontSize: 9, fontWeight: 800, minWidth: 17, height: 17, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{app.likesCount}</div>
      </div>
      <div data-testid="nav-chats" onClick={app.goMatches} style={{ ...itemStyle(app.navMatchesBg), position: 'relative' }}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 01-12.4 7.5L3 20.5l1.5-4.9A8.5 8.5 0 1121 11.5z" stroke={app.navMatches} strokeWidth="1.9" fill={app.navMatchesFill} strokeLinejoin="round" /></svg>
        <span style={{ fontSize: 10, color: app.navMatches, fontWeight: app.navMatchesW }}>chats</span>
        {app.hasUnread && (
          <div style={{ position: 'absolute', top: -1, right: 'calc(50% - 20px)', background: '#E5326E', border: '1.5px solid #201812', color: '#fff', fontSize: 9, fontWeight: 800, minWidth: 17, height: 17, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{app.unreadCount}</div>
        )}
      </div>
      <div data-testid="nav-me" onClick={app.goYou} style={itemStyle(app.navYouBg)}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={app.navYou} strokeWidth="1.9" fill={app.navYouFill} /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={app.navYou} strokeWidth="1.9" fill="none" /></svg>
        <span style={{ fontSize: 10, color: app.navYou, fontWeight: app.navYouW }}>me</span>
      </div>
    </div>
  )
}
