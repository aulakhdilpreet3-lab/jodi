import type { JodiApp } from '../useJodiApp'

export default function ChatThreadScreen({ app }: { app: JodiApp }) {
  if (!app.isChat) return null

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#F6ECD9' }}>
      <div style={{ paddingTop: 52, background: '#FBF3E4', boxShadow: '0 1.5px 0 rgba(32,24,18,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 10px' }}>
          <div onClick={app.backToMatches} style={{ width: 32, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="11" height="18" viewBox="0 0 11 18" fill="none"><path d="M9 1L2 9l7 8" stroke="#201812" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ width: 38, height: 46, borderRadius: '19px 19px 8px 8px', background: app.chatWith.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 16, color: 'rgba(255,255,255,.92)', border: '2px solid #201812' }}>{app.chatWith.mono}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: '#201812' }}>{app.chatWith.name}</span>
              <svg width="13" height="13" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16A6A0" /><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontSize: 11, color: '#16A6A0', fontWeight: 700 }}>active now</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFFDF7', border: '1.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 10l6-4v12l-6-4v3a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h9a2 2 0 012 2v1z" stroke="#201812" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>

      <div className="jScroll" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5A524', border: '2px solid #201812', color: '#201812', fontSize: 11, fontWeight: 800, padding: '5px 13px', borderRadius: 16, transform: 'rotate(-1.5deg)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" fill="#201812" /></svg>
            it's a jodi · she said hi first
          </div>
        </div>
        {app.chatMsgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.justify as 'flex-start' | 'flex-end' }}>
            <div style={{ maxWidth: '76%', padding: '10px 14px', borderRadius: m.radius, background: m.bg, color: m.color, fontSize: 14, lineHeight: 1.4, border: '2px solid #201812' }}>{m.text}</div>
          </div>
        ))}
        {app.showTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '11px 15px', borderRadius: '20px 20px 20px 6px', background: '#FFFDF7', border: '2px solid #201812', display: 'flex', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b3a48c' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b3a48c' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b3a48c' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px calc(8px + env(safe-area-inset-bottom))', background: '#FBF3E4', boxShadow: '0 -1.5px 0 rgba(32,24,18,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#FFFDF7', border: '2px solid #201812', borderRadius: 26, padding: '5px 5px 5px 16px' }}>
          <input
            value={app.draft}
            onChange={app.onDraft}
            onKeyDown={app.onDraftKey}
            placeholder="say something…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: '#201812', minWidth: 0 }}
          />
          <div onClick={app.sendMsg} style={{ width: 38, height: 38, borderRadius: '50%', background: app.sendBg, border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24"><path d="M3 12l18-8-8 18-2-7-8-3z" fill="#fff" /></svg>
          </div>
        </div>
      </div>
    </div>
  )
}
