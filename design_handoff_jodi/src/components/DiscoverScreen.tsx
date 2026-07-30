import type { JodiApp } from '../useJodiApp'

export default function DiscoverScreen({ app }: { app: JodiApp }) {
  if (!app.isDiscover) return null

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, display: 'flex', flexDirection: 'column', paddingTop: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 15, height: 15, borderRadius: '50%', background: '#E5326E' }} />
            <span style={{ width: 15, height: 15, borderRadius: '50%', background: '#F5A524', marginLeft: -6, mixBlendMode: 'multiply' }} />
          </div>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 19, color: '#201812', letterSpacing: '-.7px' }}>jodi</span>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFFDF7', border: '1.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M2.5 5h13M5 9h8M7 13h4" stroke="#201812" strokeWidth="1.9" strokeLinecap="round" /></svg>
        </div>
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 30, color: '#201812', lineHeight: .98, letterSpacing: '-1.3px' }}>five for today</div>
        <div style={{ fontSize: 12, color: '#8A7C68', marginTop: 5 }}>no endless scroll. just five. · {app.remainingLabel}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '9px 20px 6px' }}>
        {app.progressDots.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ width: '100%', height: 1.5, background: 'rgba(32,24,18,.16)' }} />
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: d.color, border: '1.5px solid #201812', marginTop: -1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.core }} />
            </div>
          </div>
        ))}
      </div>

      {app.hasDeck && (
        <div style={{ flex: 1, position: 'relative', margin: '0 18px 0' }}>
          <div style={{ position: 'absolute', left: 16, right: 16, top: 16, bottom: 74, borderRadius: '158px 158px 30px 30px', background: app.nextProfile.grad, border: '2px solid rgba(32,24,18,.3)', transform: 'rotate(2deg)', opacity: .4 }} />

          <div
            style={app.topCardWrapStyle}
            onPointerDown={app.onCardDown}
            onPointerMove={app.onCardMove}
            onPointerUp={app.onCardUp}
            onPointerCancel={app.onCardUp}
          >
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, borderRadius: '162px 162px 32px 32px', overflow: 'hidden', background: app.profile.grad, border: '2.5px solid #201812', boxShadow: '0 20px 40px rgba(32,24,18,.22)', userSelect: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.11) 0 1px,transparent 1px 15px),repeating-linear-gradient(-45deg,rgba(255,255,255,.11) 0 1px,transparent 1px 15px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: '24%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ border: '1px dashed rgba(255,255,255,.4)', borderRadius: 10, padding: '7px 13px', font: '10px ui-monospace, Menlo, monospace', color: 'rgba(255,255,255,.66)', letterSpacing: '1.4px' }}>PORTRAIT · 4:5</div>
              </div>

              <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: '#F5A524', border: '2px solid #201812', padding: '4px 12px 4px 9px', borderRadius: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#201812' }} />
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#201812' }}>{app.profile.score}% match</span>
              </div>

              <div style={{ position: 'absolute', top: 130, left: 16, border: '3.5px solid #6EE7A8', color: '#6EE7A8', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 29, padding: '2px 15px', borderRadius: 12, transform: 'rotate(-13deg)', opacity: app.likeOpacity, letterSpacing: '-.5px' }}>fr</div>
              <div style={{ position: 'absolute', top: 130, right: 16, border: '3.5px solid #FF8FA3', color: '#FF8FA3', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 29, padding: '2px 15px', borderRadius: 12, transform: 'rotate(13deg)', opacity: app.passOpacity, letterSpacing: '-.5px' }}>nah</div>

              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '60px 18px 16px', background: 'linear-gradient(to top, rgba(18,13,8,.93), rgba(18,13,8,.45) 58%, transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1, letterSpacing: '-1.1px' }}>{app.profile.name}</span>
                  <span style={{ fontSize: 19, color: 'rgba(255,255,255,.9)', fontWeight: 600 }}>{app.profile.age}</span>
                  {app.profile.verified && (
                    <svg width="15" height="15" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16A6A0" /><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, color: 'rgba(255,255,255,.8)', fontSize: 12 }}>
                  <svg width="10" height="12" viewBox="0 0 11 13" fill="none"><path d="M5.5 1C3 1 1 3 1 5.4 1 8.5 5.5 12 5.5 12S10 8.5 10 5.4C10 3 8 1 5.5 1z" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" /><circle cx="5.5" cy="5.3" r="1.5" fill="#fff" /></svg>
                  {app.profile.city} · {app.profile.dist}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {app.profile.chips.map((chip, i) => (
                    <span key={i} style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.95)', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', padding: '3px 9px', borderRadius: 20 }}>{chip}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10, background: '#FBF3E4', borderRadius: 16, padding: '10px 13px', border: '2px solid #201812' }}>
                  <div style={{ fontSize: 9.5, color: '#E5326E', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase' }}>{app.profile.promptQ}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: '#201812', marginTop: 3, lineHeight: 1.3, letterSpacing: '-.3px' }}>{app.profile.promptA}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.26)', padding: '4px 11px 4px 5px', borderRadius: 22 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="8" height="9" viewBox="0 0 9 11"><path d="M0 0l9 5.5L0 11z" fill="#E5326E" /></svg></div>
                    <span style={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                      <span style={{ width: 2.5, height: 8, background: 'rgba(255,255,255,.8)', borderRadius: 2 }} /><span style={{ width: 2.5, height: 14, background: 'rgba(255,255,255,.9)', borderRadius: 2 }} /><span style={{ width: 2.5, height: 10, background: 'rgba(255,255,255,.8)', borderRadius: 2 }} /><span style={{ width: 2.5, height: 17, background: '#fff', borderRadius: 2 }} />
                    </span>
                    <span style={{ fontSize: 10.5, color: '#fff', fontWeight: 700 }}>{app.profile.voice}</span>
                  </div>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.62)', fontWeight: 600 }}>tap for more →</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div onClick={app.undoCard} style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFDF7', border: '1.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: app.undoOpacity }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 9h10a5 5 0 010 10h-3" stroke="#201812" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 5L4 9l3.5 4" stroke="#201812" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div onClick={app.flingPass} style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFFDF7', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2.5px 2.5px 0 #201812', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 22 22"><path d="M4 4l14 14M18 4L4 18" stroke="#201812" strokeWidth="2.6" strokeLinecap="round" /></svg>
              </div>
              <div onClick={app.sendRose} style={{ width: 56, height: 56, borderRadius: '50%', background: '#16A6A0', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2.5px 2.5px 0 #201812', cursor: 'pointer' }}>
                <svg width="21" height="21" viewBox="0 0 24 24"><path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" fill="#fff" /></svg>
              </div>
              <div onClick={app.flingLike} style={{ width: 66, height: 66, borderRadius: '50%', background: '#E5326E', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0 #201812', cursor: 'pointer' }}>
                <svg width="27" height="27" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" fill="#fff" /></svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {app.deckEnded && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 42px', textAlign: 'center', gap: 13, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 20, borderRadius: '120px 120px 24px 24px', backgroundImage: 'repeating-linear-gradient(45deg,rgba(32,24,18,.07) 0 1px,transparent 1px 16px),repeating-linear-gradient(-45deg,rgba(32,24,18,.07) 0 1px,transparent 1px 16px)', pointerEvents: 'none' }} />
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#F5A524', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0 #201812', position: 'relative' }}>
            <svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" fill="none" stroke="#201812" strokeWidth="1.8" /></svg>
          </div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 25, color: '#201812', letterSpacing: '-.9px', lineHeight: 1.05, position: 'relative' }}>that's your five</div>
          <div style={{ fontSize: 13, color: '#8A7C68', lineHeight: 1.5, position: 'relative' }}>five people worth meeting &gt; five hundred to scroll past. new ones drop tomorrow at sunset.</div>
          <div onClick={app.resetDeck} style={{ marginTop: 4, padding: '12px 22px', borderRadius: 24, background: '#201812', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', position: 'relative' }}>run it back</div>
        </div>
      )}
    </div>
  )
}
