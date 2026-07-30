import { useState } from 'react'

interface Props {
  question: string
  answer: string
  onSave: (question: string, answer: string) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onClose: () => void
}

export default function EditPromptModal({ question, answer, onSave, onDelete, onClose }: Props) {
  const [q, setQ] = useState(question)
  const [a, setA] = useState(answer)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!q.trim() || !a.trim()) return
    setSaving(true)
    try {
      await onSave(q.trim(), a.trim())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(18,13,8,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF3E4', borderRadius: 22, border: '2px solid #201812', padding: 18 }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 17, color: '#201812' }}>edit prompt</div>
        <label style={{ fontSize: 10.5, color: '#8A7C68', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, marginTop: 12, display: 'block' }}>question</label>
        <input
          data-testid="prompt-question-input"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="e.g. we'll get along if"
          maxLength={80}
          style={{ width: '100%', marginTop: 5, padding: '10px 12px', borderRadius: 12, border: '2px solid #201812', background: '#FFFDF7', fontSize: 13.5, color: '#201812', outline: 'none' }}
        />
        <label style={{ fontSize: 10.5, color: '#8A7C68', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700, marginTop: 10, display: 'block' }}>answer</label>
        <textarea
          data-testid="prompt-answer-input"
          value={a}
          onChange={e => setA(e.target.value)}
          placeholder="your answer"
          maxLength={240}
          rows={3}
          style={{ width: '100%', marginTop: 5, padding: '10px 12px', borderRadius: 12, border: '2px solid #201812', background: '#FFFDF7', fontSize: 13.5, color: '#201812', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {onDelete && (
            <div onClick={() => { void (async () => { await onDelete(); onClose() })() }} style={{ padding: '12px 16px', textAlign: 'center', borderRadius: 20, border: '2px solid #201812', color: '#E5326E', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>remove</div>
          )}
          <div onClick={onClose} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 20, border: '2px solid #201812', color: '#201812', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>cancel</div>
          <div data-testid="prompt-save" onClick={() => void save()} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 20, background: '#E5326E', border: '2px solid #201812', color: '#fff', fontSize: 13.5, fontWeight: 800, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'saving…' : 'save'}</div>
        </div>
      </div>
    </div>
  )
}
