import type { JodiApp } from '../useJodiApp'

export default function MatchModal({ app }: { app: JodiApp }) {
  if (!app.showMatch) return null
  const { matchProfile } = app

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: '#E5326E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', overflow: 'hidden', animation: 'jFade .28s ease' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.1) 0 1px,transparent 1px 18px),repeating-linear-gradient(-45deg,rgba(255,255,255,.1) 0 1px,transparent 1px 18px)' }} />
      <div style={{ position: 'absolute', top: 168, left: '50%', transform: 'translateX(-50%)', width: 190, height: 190, borderRadius: '50%', border: '2px solid rgba(255,255,255,.45)', animation: 'jPulse 1.9s ease-out infinite' }} />
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.88)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, animation: 'jRise .5s ease both', position: 'relative' }}>no way</div>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 52, color: '#fff', marginTop: 6, lineHeight: 1, letterSpacing: '-2.4px', animation: 'jPop .6s cubic-bezier(.2,1.3,.4,1) both', position: 'relative' }}>it's a jodi</div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 32, position: 'relative' }}>
        <div style={{ width: 96, height: 118, borderRadius: '48px 48px 16px 16px', background: 'linear-gradient(150deg,#F5A524,#C2571A)', border: '2.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 36, color: '#fff', animation: 'jAvL .6s cubic-bezier(.2,1.3,.4,1) both', zIndex: 2 }}>R</div>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#FBF3E4', border: '2.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 -14px', zIndex: 3, animation: 'jPop .7s .2s cubic-bezier(.2,1.3,.4,1) both' }}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" fill="#E5326E" /></svg>
        </div>
        <div style={{ width: 96, height: 118, borderRadius: '48px 48px 16px 16px', background: matchProfile.grad, border: '2.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 36, color: '#fff', animation: 'jAvR .6s cubic-bezier(.2,1.3,.4,1) both', zIndex: 2 }}>{matchProfile.mono}</div>
      </div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,.95)', marginTop: 26, lineHeight: 1.5, fontWeight: 500, animation: 'jRise .6s .15s ease both', position: 'relative' }}>
        you and {matchProfile.name} both said hi.<br />she goes first — house rules.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 26, width: '100%', animation: 'jRise .6s .25s ease both', position: 'relative' }}>
        <div onClick={app.messageMatch} style={{ padding: 16, borderRadius: 28, background: '#F5A524', border: '2.5px solid #201812', boxShadow: '3px 3px 0 #201812', color: '#201812', fontSize: 15.5, fontWeight: 800, cursor: 'pointer' }}>start the convo</div>
        <div onClick={app.closeMatch} style={{ padding: 14, borderRadius: 28, background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '2px solid rgba(255,255,255,.55)' }}>keep looking</div>
      </div>
    </div>
  )
}
