import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { COLORS, FONTS } from '../theme'

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
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>edit prompt</Text>
          <Text style={styles.label}>question</Text>
          <TextInput value={q} onChangeText={setQ} placeholder="e.g. we'll get along if" placeholderTextColor="#B7AA92" style={styles.input} />
          <Text style={styles.label}>answer</Text>
          <TextInput value={a} onChangeText={setA} placeholder="your answer" placeholderTextColor="#B7AA92" style={[styles.input, styles.textarea]} multiline numberOfLines={3} />
          <View style={styles.row}>
            {onDelete && (
              <Pressable onPress={() => { void (async () => { await onDelete(); onClose() })() }} style={styles.removeBtn}><Text style={styles.removeText}>remove</Text></Pressable>
            )}
            <Pressable onPress={onClose} style={styles.cancelBtn}><Text style={styles.cancelText}>cancel</Text></Pressable>
            <Pressable onPress={() => void save()} style={[styles.saveBtn, saving && { opacity: 0.7 }]}><Text style={styles.saveText}>{saving ? 'saving…' : 'save'}</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(18,13,8,.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: COLORS.screenBg, borderRadius: 22, borderWidth: 2, borderColor: COLORS.ink, padding: 18 },
  title: { fontFamily: FONTS.display, fontSize: 17, color: COLORS.ink },
  label: { fontSize: 10.5, color: COLORS.inkFaint, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: FONTS.bodyBold, marginTop: 10, marginBottom: 5 },
  input: { padding: 11, borderRadius: 12, borderWidth: 2, borderColor: COLORS.ink, backgroundColor: COLORS.card, fontSize: 13.5, color: COLORS.ink },
  textarea: { height: 76, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  removeBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ink },
  removeText: { color: COLORS.pink, fontSize: 13.5, fontFamily: FONTS.bodyBold },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ink },
  cancelText: { color: COLORS.ink, fontSize: 13.5, fontFamily: FONTS.bodyBold },
  saveBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 20, backgroundColor: COLORS.pink, borderWidth: 2, borderColor: COLORS.ink },
  saveText: { color: '#fff', fontSize: 13.5, fontFamily: FONTS.bodyHeavy },
})
