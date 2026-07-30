import type { JodiApp } from '../useJodiApp'

export default function MeScreen({ app }: { app: JodiApp }) {
  if (!app.isYou) return null

  return (
    <div className="jScroll" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, paddingTop: 52, overflow: 'auto' }}>
      <div style={{ padding: '16px 20px 10px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 62, height: 76, borderRadius: '31px 31px 12px 12px', background: 'linear-gradient(150deg,#E5326E,#8E1247)', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 25, color: '#fff', position: 'relative' }}>
          R
          <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#FBF3E4', borderRadius: '50%', padding: 2 }}>
            <svg width="17" height="17" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16A6A0" /><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: '#201812', letterSpacing: '-1px' }}>rhea, 26</div>
          <div style={{ fontSize: 12, color: '#8A7C68', marginTop: 2 }}>photo + ID verified · unidays student</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFFDF7', border: '1.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#201812" strokeWidth="1.7" /><path d="M19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1l-.4-2.5h-4l-.4 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.4 2.5h4l.4-2.5a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z" stroke="#201812" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <div style={{ margin: '4px 16px 14px', padding: '15px 17px', borderRadius: 22, background: '#FFFDF7', border: '2px solid #201812' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#201812' }}>profile strength</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#16A6A0' }}>82%</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: '#EFE3CC', border: '2px solid #201812', marginTop: 8, overflow: 'hidden' }}>
          <div style={{ width: '82%', height: '100%', background: '#E5326E' }} />
        </div>
        <div style={{ fontSize: 11.5, color: '#8A7C68', marginTop: 8 }}>add a voice intro to hit 100% — profiles with voice get 2× more hellos.</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E5326E', border: '1.5px solid #201812' }} />
        <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>your prompts</span>
      </div>
      <div style={{ margin: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: '14px 16px', borderRadius: 20, background: '#FFFDF7', border: '2px solid #201812' }}>
          <div style={{ fontSize: 9.5, color: '#E5326E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px' }}>my love language is</div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 16, color: '#201812', marginTop: 4, letterSpacing: '-.3px' }}>feeding you until you physically cannot move</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 20, background: '#FFFDF7', border: '2px solid #201812' }}>
          <div style={{ fontSize: 9.5, color: '#E5326E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px' }}>green flag i look for</div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 16, color: '#201812', marginTop: 4, letterSpacing: '-.3px' }}>texts back + gets along with the aunties</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A6A0', border: '1.5px solid #201812' }} />
        <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>the non-negotiables</span>
      </div>
      <div style={{ margin: '0 16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {app.prefs.map((p) => (
          <div key={p.k} style={{ padding: '12px 14px', borderRadius: 18, background: '#FFFDF7', border: '2px solid #201812' }}>
            <div style={{ fontSize: 11, color: '#8A7C68' }}>{p.k}</div>
            <div style={{ fontSize: 14, color: '#201812', fontWeight: 700, marginTop: 3 }}>{p.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
