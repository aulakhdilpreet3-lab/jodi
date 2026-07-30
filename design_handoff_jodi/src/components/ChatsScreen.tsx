import type { JodiApp } from '../useJodiApp'

export default function ChatsScreen({ app }: { app: JodiApp }) {
  if (!app.isMatches) return null

  return (
    <div className="jScroll" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, paddingTop: 52, overflow: 'auto' }}>
      <div style={{ padding: '14px 20px 8px' }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 29, color: '#201812', letterSpacing: '-1.2px' }}>chats</div>
      </div>
      <div style={{ padding: '2px 0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F5A524', border: '1.5px solid #201812' }} />
          <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>your jodis</span>
        </div>
        <div className="jScroll" style={{ display: 'flex', gap: 14, overflow: 'auto', padding: '0 20px 4px' }}>
          {app.newMatches.map((nm) => (
            <div key={nm.name} onClick={() => app.openChat(nm.name)} style={{ textAlign: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 64, height: 78, borderRadius: '32px 32px 12px 12px', background: nm.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: 'rgba(255,255,255,.92)', border: '2px solid #201812' }}>{nm.mono}</div>
              <div style={{ fontSize: 11.5, color: '#201812', marginTop: 5, fontWeight: 600 }}>{nm.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 1.5, background: 'rgba(32,24,18,.1)', margin: '2px 20px 4px' }} />
      <div>
        {app.chats.map((c) => (
          <div key={c.name} onClick={() => app.openChat(c.name)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 20px', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 64, borderRadius: '26px 26px 10px 10px', background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 21, color: 'rgba(255,255,255,.92)', flexShrink: 0, position: 'relative', border: '2px solid #201812' }}>
              {c.mono}
              {c.online && <div style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: '#16A6A0', border: '2px solid #FBF3E4' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15.5, fontWeight: 700, color: '#201812' }}>{c.name}</span>
                <span style={{ fontSize: 11, color: '#A69A85' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 13, color: c.snipColor, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: c.snipWeight }}>{c.snippet}</div>
            </div>
            {c.unread && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5326E', flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
