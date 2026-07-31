import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { COLORS, FONTS } from '../theme'

interface Props {
  title: string
  value: string
  placeholder?: string
  onSave: (value: string) => Promise<void> | void
  onClose: () => void
}

export default function EditFieldModal({ title, value, placeholder, onSave, onClose }: Props) {
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
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            autoFocus
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => void save()}
            placeholder={placeholder}
            placeholderTextColor="#B7AA92"
            style={styles.input}
          />
          <View style={styles.row}>
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
  input: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: COLORS.ink, backgroundColor: COLORS.card, fontSize: 14, color: COLORS.ink },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ink },
  cancelText: { color: COLORS.ink, fontSize: 13.5, fontFamily: FONTS.bodyBold },
  saveBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 20, backgroundColor: COLORS.pink, borderWidth: 2, borderColor: COLORS.ink },
  saveText: { color: '#fff', fontSize: 13.5, fontFamily: FONTS.bodyHeavy },
})
