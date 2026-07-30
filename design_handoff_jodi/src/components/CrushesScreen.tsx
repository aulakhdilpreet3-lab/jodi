import type { JodiApp } from '../useJodiApp'

export default function CrushesScreen({ app }: { app: JodiApp }) {
  if (!app.isLikes) return null

  return (
    <div className="jScroll" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, paddingTop: 52, overflow: 'auto' }}>
      <div style={{ padding: '14px 20px 6px' }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 29, color: '#201812', letterSpacing: '-1.2px' }}>who's into you</div>
        <div style={{ fontSize: 12, color: '#8A7C68', marginTop: 4 }}>{app.likesCount} people said hi. say hi back to unblur.</div>
      </div>
      <div onClick={app.goLikes} style={{ margin: '10px 16px 14px', borderRadius: 22, background: '#201812', padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 13, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(245,165,36,.12) 0 1px,transparent 1px 14px),repeating-linear-gradient(-45deg,rgba(245,165,36,.12) 0 1px,transparent 1px 14px)' }} />
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F5A524', border: '1.5px solid #FBF3E4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" fill="#201812" /></svg>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ color: '#fff', fontSize: 14.5, fontWeight: 700 }}>see everyone at once</div>
          <div style={{ color: 'rgba(255,255,255,.62)', fontSize: 11.5, marginTop: 1 }}>jodi gold · unblur every crush</div>
        </div>
        <div style={{ background: '#F5A524', color: '#201812', fontSize: 12, fontWeight: 800, padding: '9px 15px', borderRadius: 20, cursor: 'pointer', position: 'relative' }}>get it</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, padding: '0 16px 20px' }}>
        {app.likesYou.map((lk, i) => (
          <div key={i} onClick={app.goLikes} style={{ position: 'relative', borderRadius: '88px 88px 20px 20px', overflow: 'hidden', aspectRatio: '3/4', background: lk.grad, border: '2px solid #201812', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.11) 0 1px,transparent 1px 14px),repeating-linear-gradient(-45deg,rgba(255,255,255,.11) 0 1px,transparent 1px 14px)' }} />
            <div style={{ position: 'absolute', inset: 0, backdropFilter: lk.blur, background: 'rgba(18,13,8,.06)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px 12px 11px', background: 'linear-gradient(to top, rgba(18,13,8,.85), transparent)' }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{lk.hint}</div>
              <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 10.5, marginTop: 1 }}>{lk.city}</div>
            </div>
            {lk.rose && (
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)', display: 'flex', alignItems: 'center', gap: 4, background: '#16A6A0', border: '1.5px solid #201812', padding: '3px 9px 3px 7px', borderRadius: 14 }}>
                <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" fill="#fff" /></svg>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff' }}>rose</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
