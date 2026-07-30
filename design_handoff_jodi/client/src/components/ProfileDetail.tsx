import { useState } from 'react'
import { useAudioPlayer } from '../useAudioPlayer'
import type { JodiApp } from '../useJodiApp'

const REPORT_REASONS = ['fake profile', 'inappropriate photos', 'harassment', 'something else']

export default function ProfileDetail({ app }: { app: JodiApp }) {
  const [reporting, setReporting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const voice = useAudioPlayer(app.detail?.voiceUrl ?? null)

  if (!app.showDetail || !app.detail) return null
  const detail = app.detail
  const photoUrl = detail.photos[0]?.url

  const submitReport = async (reason: string) => {
    setReporting(false)
    await app.reportProfile(detail.id, reason)
    await app.blockProfile(detail.id)
    setStatus('reported — you won\'t see them again')
    setTimeout(() => { app.closeDetail() }, 900)
  }

  const block = async () => {
    await app.blockProfile(detail.id)
    setStatus('blocked')
    setTimeout(() => { app.closeDetail() }, 700)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: '#F6ECD9', backgroundImage: 'radial-gradient(circle, rgba(32,24,18,.06) 1.4px, transparent 1.5px)', backgroundSize: '15px 15px', display: 'flex', flexDirection: 'column', animation: 'jFade .2s ease' }}>
      <div className="jScroll" style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative', padding: '52px 16px 0' }}>
          <div style={{ position: 'relative', height: 400, borderRadius: '168px 168px 28px 28px', overflow: 'hidden', background: photoUrl ? '#120d08' : detail.grad, backgroundImage: photoUrl ? `url(${photoUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', border: '2.5px solid #201812' }}>
            {!photoUrl && (
              <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,.11) 0 1px,transparent 1px 15px),repeating-linear-gradient(-45deg,rgba(255,255,255,.11) 0 1px,transparent 1px 15px)' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '26%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ border: '1px dashed rgba(255,255,255,.4)', borderRadius: 10, padding: '7px 13px', font: '10px ui-monospace, Menlo, monospace', color: 'rgba(255,255,255,.66)', letterSpacing: '1.4px' }}>PORTRAIT · 4:5</div>
                </div>
              </>
            )}
            {detail.score > 0 && (
              <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: '#F5A524', border: '2px solid #201812', padding: '4px 12px 4px 9px', borderRadius: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#201812' }} />
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#201812' }}>{detail.score}% match</span>
              </div>
            )}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '70px 18px 18px', background: 'linear-gradient(to top, rgba(18,13,8,.93), transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', lineHeight: 1, letterSpacing: '-1.3px' }}>{detail.name}</span>
                {detail.age > 0 && <span style={{ fontSize: 20, color: 'rgba(255,255,255,.9)', fontWeight: 600 }}>{detail.age}</span>}
                {detail.verified && (
                  <svg width="16" height="16" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16A6A0" /><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
              {detail.city && <div style={{ color: 'rgba(255,255,255,.82)', fontSize: 12.5, marginTop: 5 }}>{detail.city}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 9 }}>
                {detail.chips.map((chip, i) => (
                  <span key={i} style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.95)', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', padding: '3px 9px', borderRadius: 20 }}>{chip}</span>
                ))}
              </div>
            </div>
          </div>
          <div data-testid="detail-close" onClick={app.closeDetail} style={{ position: 'absolute', top: 62, left: 28, width: 40, height: 40, borderRadius: '50%', background: '#FBF3E4', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}>
            <svg width="11" height="18" viewBox="0 0 11 18" fill="none"><path d="M9 1L2 9l7 8" stroke="#201812" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        {app.detailCompat.length > 0 && (
          <div style={{ margin: '14px 16px', padding: '16px 18px', borderRadius: 24, background: '#FFFDF7', border: '2px solid #201812' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F5A524', border: '1.5px solid #201812' }} />
              <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>why you'd get along</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 12 }}>
              {app.detailCompat.map((c) => (
                <div key={c.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, color: '#201812', fontWeight: 700 }}>{c.label}</span>
                    <span style={{ fontSize: 12, color: '#8A7C68' }}>{c.value}</span>
                  </div>
                  <div style={{ height: 9, borderRadius: 5, background: '#EFE3CC', border: '2px solid #201812', marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: c.width, height: '100%', background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {detail.voiceUrl && (
          <div onClick={voice.toggle} style={{ margin: '0 16px 14px', padding: '14px 16px', borderRadius: 24, background: '#201812', display: 'flex', alignItems: 'center', gap: 13, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(245,165,36,.1) 0 1px,transparent 1px 14px),repeating-linear-gradient(-45deg,rgba(245,165,36,.1) 0 1px,transparent 1px 14px)' }} />
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E5326E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
              {voice.playing
                ? <svg width="13" height="15" viewBox="0 0 9 11"><rect x="0" y="0" width="3.2" height="11" fill="#fff" /><rect x="5.8" y="0" width="3.2" height="11" fill="#fff" /></svg>
                : <svg width="13" height="15" viewBox="0 0 9 11"><path d="M0 0l9 5.5L0 11z" fill="#fff" /></svg>}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700 }}>voice intro</div>
              <div style={{ color: 'rgba(255,255,255,.57)', fontSize: 11.5, marginTop: 1 }}>hear how {detail.name} actually sounds · {formatDur(detail.voiceDurationSec)}</div>
            </div>
            <span style={{ display: 'flex', gap: 2.5, alignItems: 'center', position: 'relative' }}>
              <span style={{ width: 2.5, height: 10, background: 'rgba(255,255,255,.5)', borderRadius: 2 }} /><span style={{ width: 2.5, height: 18, background: 'rgba(255,255,255,.8)', borderRadius: 2 }} /><span style={{ width: 2.5, height: 13, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} /><span style={{ width: 2.5, height: 22, background: '#fff', borderRadius: 2 }} /><span style={{ width: 2.5, height: 11, background: 'rgba(255,255,255,.5)', borderRadius: 2 }} />
            </span>
          </div>
        )}

        {app.detailPrompts.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E5326E', border: '1.5px solid #201812' }} />
              <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>prompts{app.detailIsDeckCard ? ' · heart one to reply' : ''}</span>
            </div>
            <div style={{ margin: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {app.detailPrompts.map((p, i) => (
                <div key={i} style={{ position: 'relative', padding: app.detailIsDeckCard ? '15px 58px 16px 17px' : '15px 17px 16px', borderRadius: 24, background: '#FFFDF7', border: '2px solid #201812' }}>
                  <div style={{ fontSize: 9.5, color: '#E5326E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px' }}>{p.q}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 17, color: '#201812', marginTop: 5, lineHeight: 1.35, letterSpacing: '-.3px' }}>{p.a}</div>
                  {app.detailIsDeckCard && (
                    <div onClick={app.detailLike} style={{ position: 'absolute', right: 13, bottom: 13, width: 38, height: 38, borderRadius: '50%', background: '#FBF3E4', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" fill="none" stroke="#E5326E" strokeWidth="2" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ margin: '0 16px 20px', padding: '14px 16px', borderRadius: 20, border: '2px dashed rgba(32,24,18,.24)', display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3v6c0 4.4-3.2 8.2-8 9-4.8-.8-8-4.6-8-9V6l8-3z" stroke="#8A7C68" strokeWidth="1.7" strokeLinejoin="round" /></svg>
          <div style={{ flex: 1, fontSize: 12, color: '#8A7C68', lineHeight: 1.4, minWidth: 140 }}>
            {status ?? (detail.verified ? 'photo + ID verified by jodi. something feel off?' : 'not yet verified. something feel off?')}
          </div>
          {!status && !reporting && (
            <>
              <span data-testid="detail-block" onClick={block} style={{ fontSize: 12, fontWeight: 700, color: '#201812', cursor: 'pointer' }}>block</span>
              <span data-testid="detail-report" onClick={() => setReporting(true)} style={{ fontSize: 12, fontWeight: 700, color: '#E5326E', cursor: 'pointer' }}>report</span>
            </>
          )}
          {reporting && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%' }}>
              {REPORT_REASONS.map(r => (
                <span key={r} data-testid="detail-report-reason" onClick={() => void submitReport(r)} style={{ fontSize: 11, fontWeight: 700, color: '#201812', background: '#FBF3E4', border: '1.5px solid #201812', borderRadius: 14, padding: '5px 10px', cursor: 'pointer' }}>{r}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {app.detailIsDeckCard && (
        <div style={{ padding: '12px 18px calc(14px + env(safe-area-inset-bottom))', background: '#FBF3E4', boxShadow: '0 -1.5px 0 rgba(32,24,18,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 13 }}>
          <div onClick={app.detailPass} style={{ width: 54, height: 54, borderRadius: '50%', background: '#FFFDF7', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2.5px 2.5px 0 #201812', cursor: 'pointer' }}>
            <svg width="19" height="19" viewBox="0 0 22 22"><path d="M4 4l14 14M18 4L4 18" stroke="#201812" strokeWidth="2.6" strokeLinecap="round" /></svg>
          </div>
          <div onClick={app.detailRose} style={{ width: 54, height: 54, borderRadius: '50%', background: '#16A6A0', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2.5px 2.5px 0 #201812', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" fill="#fff" /></svg>
          </div>
          <div onClick={app.detailLike} style={{ flex: 1, height: 54, borderRadius: 27, background: '#E5326E', border: '2px solid #201812', boxShadow: '3px 3px 0 #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: 'pointer' }}>
            <svg width="21" height="21" viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" fill="#fff" /></svg>
            <span style={{ color: '#fff', fontSize: 15.5, fontWeight: 800 }}>say hi</span>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDur(sec: number | null): string {
  if (!sec) return '0:00'
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
