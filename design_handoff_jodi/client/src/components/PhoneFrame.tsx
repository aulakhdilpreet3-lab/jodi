import type { CSSProperties, ReactNode } from 'react'

const screenStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: 42,
  overflow: 'hidden',
  background: '#FBF3E4',
  backgroundImage: 'radial-gradient(circle, rgba(32,24,18,.06) 1.4px, transparent 1.5px)',
  backgroundSize: '15px 15px',
  fontFamily: "'Hanken Grotesk', sans-serif",
}

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 34, color: '#201812', letterSpacing: '-1.2px' }}>jodi</div>
        <div style={{ fontSize: 11, color: '#8A7C68', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>desi dating · drag the card · tap it to open</div>
      </div>

      <div style={{ marginTop: 20, width: 402, height: 864, maxWidth: '100%', borderRadius: 52, background: '#120d08', padding: 11, boxShadow: '0 50px 90px rgba(32,24,18,.32), 0 0 0 1px rgba(0,0,0,.4)' }}>
        <div style={screenStyle}>
          <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 120, height: 34, borderRadius: 20, background: '#120d08', zIndex: 55 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 26px 0', zIndex: 30 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#201812' }}>9:41</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx=".7" fill="#201812" /><rect x="4.5" y="4.5" width="3" height="6.5" rx=".7" fill="#201812" /><rect x="9" y="2.2" width="3" height="8.8" rx=".7" fill="#201812" /><rect x="13.5" y="0" width="3" height="11" rx=".7" fill="#201812" /></svg>
              <svg width="24" height="12" viewBox="0 0 24 12"><rect x="1" y="1" width="19" height="10" rx="3" fill="none" stroke="#201812" strokeOpacity=".4" /><rect x="2.5" y="2.5" width="15" height="7" rx="1.6" fill="#201812" /><rect x="21" y="4" width="2" height="4" rx="1" fill="#201812" fillOpacity=".5" /></svg>
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
