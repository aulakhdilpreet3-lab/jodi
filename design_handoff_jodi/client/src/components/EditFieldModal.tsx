import { useState } from 'react'

interface Props {
  title: string
  hint?: string
  value: string
  placeholder?: string
  onSave: (value: string) => Promise<void> | void
  onClose: () => void
}

export default function EditFieldModal({ title, hint, value, placeholder, onSave, onClose }: Props) {
  const [text, setText] = useState(value)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await onSave(text.trim())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(18,13,8,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF3E4', borderRadius: 22, border: '2px solid #201812', padding: 18 }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 17, color: '#201812' }}>{title}</div>
        {hint && <div style={{ fontSize: 11.5, color: '#8A7C68', marginTop: 3 }}>{hint}</div>}
        <input
          data-testid="edit-field-input"
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void save() }}
          placeholder={placeholder}
          maxLength={120}
          style={{ width: '100%', marginTop: 12, padding: '11px 13px', borderRadius: 12, border: '2px solid #201812', background: '#FFFDF7', fontSize: 14, color: '#201812', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <div onClick={onClose} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 20, border: '2px solid #201812', color: '#201812', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>cancel</div>
          <div data-testid="edit-field-save" onClick={() => void save()} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 20, background: '#E5326E', border: '2px solid #201812', color: '#fff', fontSize: 13.5, fontWeight: 800, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'saving…' : 'save'}</div>
        </div>
      </div>
    </div>
  )
}
