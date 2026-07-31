import { useRef, useState, type ChangeEvent } from 'react'
import { useAudioPlayer } from '../useAudioPlayer'
import { useVoiceRecorder } from '../useVoiceRecorder'
import type { JodiApp } from '../useJodiApp'
import EditFieldModal from './EditFieldModal'
import EditPromptModal from './EditPromptModal'

const PREF_META: { field: 'familyCloseness' | 'faith' | 'languages' | 'kids'; label: string; placeholder: string }[] = [
  { field: 'familyCloseness', label: 'family', placeholder: 'e.g. very close' },
  { field: 'faith', label: 'faith', placeholder: 'e.g. practising, relaxed' },
  { field: 'languages', label: 'languages', placeholder: 'e.g. hindi, urdu, english' },
  { field: 'kids', label: 'kids', placeholder: 'e.g. someday' },
]

function nextStepHint(me: NonNullable<JodiApp['me']>): string {
  if (!me.photos.length) return 'add a photo — profiles with one get seen first.'
  if (me.prompts.length < 3) return 'add a prompt to hit 100% — three beats one.'
  if (!me.voiceUrl) return 'add a voice intro to hit 100% — profiles with voice get 2× more hellos.'
  if (!me.city) return 'add your city so people know where you are.'
  if (!me.familyCloseness || !me.faith || !me.languages || !me.kids) return 'fill in your non-negotiables below.'
  return "you're all set."
}

export default function MeScreen({ app }: { app: JodiApp }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editField, setEditField] = useState<{ field: string; title: string; hint?: string; value: string; placeholder?: string } | null>(null)
  const [editPromptIdx, setEditPromptIdx] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const recorder = useVoiceRecorder()
  const myVoice = useAudioPlayer(app.me?.voiceUrl ?? null)

  if (!app.isYou || !app.me) return null
  const me = app.me

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try { await app.uploadPhoto(file) } finally { setUploading(false) }
  }

  const saveVoice = async () => {
    if (!recorder.result) return
    await app.uploadVoice(recorder.result.blob, recorder.result.durationSec)
    recorder.reset()
  }

  return (
    <div className="jScroll" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, paddingTop: 52, overflow: 'auto' }}>
      <input data-testid="photo-input" ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickPhoto} />

      <div style={{ padding: '16px 20px 10px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 62, height: 76, borderRadius: '31px 31px 12px 12px', border: '2px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 25, color: '#fff', position: 'relative', cursor: 'pointer', flexShrink: 0,
            background: me.photos[0] ? `#120d08 url(${me.photos[0].url}) center/cover` : me.grad,
          }}
        >
          {!me.photos[0] && me.mono}
          <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#FBF3E4', borderRadius: '50%', padding: 2 }}>
            {me.verified
              ? <svg width="17" height="17" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#16A6A0" /><path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M4 12h16" stroke="#201812" strokeWidth="2" strokeLinecap="round" /></svg>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={() => setEditField({ field: 'name', title: 'your name', value: me.name })} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: '#201812', letterSpacing: '-1px', cursor: 'pointer' }}>{me.name}, {me.age}</div>
          <div onClick={() => setEditField({ field: 'city', title: 'your city', value: me.city, placeholder: 'e.g. Jersey City' })} style={{ fontSize: 12, color: '#8A7C68', marginTop: 2, cursor: 'pointer' }}>
            {me.verified ? 'photo + ID verified · ' : 'not yet verified · '}{me.city || 'tap to set your city'}
          </div>
        </div>
        <div data-testid="logout" onClick={app.logout} style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFFDF7', border: '1.5px solid #201812', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title="log out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#201812" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 17l5-5-5-5M21 12H9" stroke="#201812" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <div style={{ margin: '4px 16px 14px', padding: '15px 17px', borderRadius: 22, background: '#FFFDF7', border: '2px solid #201812' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#201812' }}>profile strength</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#16A6A0' }}>{me.profileStrength}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: '#EFE3CC', border: '2px solid #201812', marginTop: 8, overflow: 'hidden' }}>
          <div style={{ width: `${me.profileStrength}%`, height: '100%', background: '#E5326E', transition: 'width .3s ease' }} />
        </div>
        <div style={{ fontSize: 11.5, color: '#8A7C68', marginTop: 8 }}>{nextStepHint(me)}</div>
      </div>

      {me.photos.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F5A524', border: '1.5px solid #201812' }} />
            <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>your photos</span>
          </div>
          <div className="jScroll" style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '0 16px 14px' }}>
            {me.photos.map(p => (
              <div key={p.id} style={{ position: 'relative', width: 76, height: 96, borderRadius: 16, overflow: 'hidden', border: '2px solid #201812', background: `#120d08 url(${p.url}) center/cover`, flexShrink: 0 }}>
                <div onClick={() => void app.deletePhoto(p.id)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(18,13,8,.75)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</div>
              </div>
            ))}
            <div onClick={() => fileInputRef.current?.click()} style={{ width: 76, height: 96, borderRadius: 16, border: '2px dashed rgba(32,24,18,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#8A7C68', fontSize: 22 }}>
              {uploading ? '…' : '+'}
            </div>
          </div>
        </>
      )}
      {me.photos.length === 0 && (
        <div onClick={() => fileInputRef.current?.click()} style={{ margin: '0 16px 14px', padding: '14px 16px', borderRadius: 20, border: '2px dashed rgba(32,24,18,.3)', textAlign: 'center', fontSize: 12.5, color: '#8A7C68', cursor: 'pointer' }}>
          {uploading ? 'uploading…' : '+ add your first photo'}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A6A0', border: '1.5px solid #201812' }} />
        <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>voice intro</span>
      </div>
      <div style={{ margin: '0 16px 14px' }}>
        {me.voiceUrl && !recorder.result && (
          <div style={{ padding: '14px 16px', borderRadius: 20, background: '#201812', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={myVoice.toggle} style={{ width: 38, height: 38, borderRadius: '50%', background: '#E5326E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {myVoice.playing
                ? <svg width="12" height="14" viewBox="0 0 9 11"><rect x="0" y="0" width="3.2" height="11" fill="#fff" /><rect x="5.8" y="0" width="3.2" height="11" fill="#fff" /></svg>
                : <svg width="12" height="14" viewBox="0 0 9 11"><path d="M0 0l9 5.5L0 11z" fill="#fff" /></svg>}
            </div>
            <div style={{ flex: 1, color: '#fff', fontSize: 13, fontWeight: 700 }}>your voice intro</div>
            <span onClick={() => void app.deleteVoice()} style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>remove</span>
          </div>
        )}
        {!me.voiceUrl && !recorder.result && !recorder.recording && (
          <div onClick={() => void recorder.start()} style={{ padding: '14px 16px', borderRadius: 20, border: '2px dashed rgba(32,24,18,.3)', textAlign: 'center', fontSize: 12.5, color: '#8A7C68', cursor: 'pointer' }}>
            + record a voice intro
          </div>
        )}
        {recorder.recording && (
          <div onClick={recorder.stop} style={{ padding: '14px 16px', borderRadius: 20, background: '#E5326E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: '#fff' }} />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>recording… tap to stop</span>
          </div>
        )}
        {recorder.result && (
          <div style={{ padding: '14px 16px', borderRadius: 20, background: '#FFFDF7', border: '2px solid #201812', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 12.5, color: '#201812', fontWeight: 600 }}>got it — {Math.round(recorder.result.durationSec)}s recorded</div>
            <span onClick={recorder.reset} style={{ fontSize: 11.5, fontWeight: 700, color: '#8A7C68', cursor: 'pointer' }}>discard</span>
            <span onClick={() => void saveVoice()} style={{ fontSize: 11.5, fontWeight: 800, color: '#E5326E', cursor: 'pointer' }}>save</span>
          </div>
        )}
        {recorder.error && <div style={{ fontSize: 11, color: '#E5326E', marginTop: 6 }}>{recorder.error}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E5326E', border: '1.5px solid #201812' }} />
        <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>your prompts</span>
      </div>
      <div style={{ margin: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {me.prompts.map((p, i) => (
          <div key={p.id ?? i} onClick={() => setEditPromptIdx(i)} style={{ padding: '14px 16px', borderRadius: 20, background: '#FFFDF7', border: '2px solid #201812', cursor: 'pointer' }}>
            <div style={{ fontSize: 9.5, color: '#E5326E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px' }}>{p.question}</div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 16, color: '#201812', marginTop: 4, letterSpacing: '-.3px' }}>{p.answer}</div>
          </div>
        ))}
        {me.prompts.length < 3 && (
          <div data-testid="prompt-add" onClick={() => setEditPromptIdx(me.prompts.length)} style={{ padding: '14px 16px', borderRadius: 20, border: '2px dashed rgba(32,24,18,.3)', textAlign: 'center', fontSize: 12.5, color: '#8A7C68', cursor: 'pointer' }}>
            + add a prompt
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px 8px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A6A0', border: '1.5px solid #201812' }} />
        <span style={{ fontSize: 11, color: '#8A7C68', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>the non-negotiables</span>
      </div>
      <div style={{ margin: '0 16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {PREF_META.map(({ field, label, placeholder }) => (
          <div
            key={field}
            data-testid={`pref-${field}`}
            onClick={() => setEditField({ field, title: label, value: me[field], placeholder })}
            style={{ padding: '12px 14px', borderRadius: 18, background: '#FFFDF7', border: '2px solid #201812', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 11, color: '#8A7C68' }}>{label}</div>
            <div style={{ fontSize: 14, color: me[field] ? '#201812' : '#B7AA92', fontWeight: 700, marginTop: 3 }}>{me[field] || 'tap to set'}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 10 }}>
        <span
          onClick={() => {
            if (window.confirm('delete your account? this permanently deletes your profile, matches, and messages. this cannot be undone.')) {
              void app.deleteAccount()
            }
          }}
          style={{ fontSize: 12, color: '#8A7C68', textDecoration: 'underline', cursor: 'pointer' }}
        >
          delete my account
        </span>
      </div>

      {editField && (
        <EditFieldModal
          title={editField.title}
          hint={editField.hint}
          value={editField.value}
          placeholder={editField.placeholder}
          onClose={() => setEditField(null)}
          onSave={async (v) => { await app.updateProfileField(editField.field, v) }}
        />
      )}
      {editPromptIdx !== null && (
        <EditPromptModal
          question={me.prompts[editPromptIdx]?.question ?? ''}
          answer={me.prompts[editPromptIdx]?.answer ?? ''}
          onClose={() => setEditPromptIdx(null)}
          onSave={async (question, answer) => {
            const next = me.prompts.map(p => ({ question: p.question, answer: p.answer }))
            next[editPromptIdx] = { question, answer }
            await app.updatePrompts(next)
          }}
          onDelete={me.prompts[editPromptIdx] ? async () => {
            const next = me.prompts.filter((_, i) => i !== editPromptIdx).map(p => ({ question: p.question, answer: p.answer }))
            await app.updatePrompts(next)
          } : undefined}
        />
      )}
    </div>
  )
}
