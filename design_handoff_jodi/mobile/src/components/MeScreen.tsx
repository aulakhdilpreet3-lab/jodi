import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { mediaUrl } from '../api'
import { LogoutIcon, PlusIcon, VerifiedBadge } from '../icons'
import { COLORS, FONTS, parseGradient } from '../theme'
import { useSoundPlayer } from '../useSoundPlayer'
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
  const insets = useSafeAreaInsets()
  const [editField, setEditField] = useState<{ field: string; title: string; value: string; placeholder?: string } | null>(null)
  const [editPromptIdx, setEditPromptIdx] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const recorder = useVoiceRecorder()
  const myVoice = useSoundPlayer(app.me?.voiceUrl ?? null)

  if (!app.isYou || !app.me) return null
  const me = app.me
  const [gradA, gradB] = parseGradient(me.grad)

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [4, 5] })
    if (result.canceled || !result.assets[0]) return
    setUploading(true)
    try { await app.uploadPhoto(result.assets[0].uri) } finally { setUploading(false) }
  }

  const saveVoice = async () => {
    if (!recorder.result) return
    await app.uploadVoice(recorder.result.uri, recorder.result.durationSec)
    recorder.reset()
  }

  const confirmDeleteAccount = () => {
    Alert.alert(
      'delete your account?',
      'this permanently deletes your profile, matches, and messages. this cannot be undone.',
      [
        { text: 'cancel', style: 'cancel' },
        { text: 'delete', style: 'destructive', onPress: () => void app.deleteAccount() },
      ],
    )
  }

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 90 }}>
      <View style={styles.headerRow}>
        <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
          {me.photos[0]
            ? <Image source={{ uri: mediaUrl(me.photos[0].url)! }} style={styles.avatarImg} contentFit="cover" />
            : <LinearGradient colors={[gradA, gradB]} style={styles.avatarImg}><Text style={styles.avatarMono}>{me.mono}</Text></LinearGradient>}
          <View style={styles.verifyBadge}>{me.verified ? <VerifiedBadge size={17} /> : <PlusIcon size={17} />}</View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => setEditField({ field: 'name', title: 'your name', value: me.name })}>
            <Text style={styles.name}>{me.name}, {me.age}</Text>
          </Pressable>
          <Pressable onPress={() => setEditField({ field: 'city', title: 'your city', value: me.city, placeholder: 'e.g. Jersey City' })}>
            <Text style={styles.sub}>{me.verified ? 'photo + ID verified · ' : 'not yet verified · '}{me.city || 'tap to set your city'}</Text>
          </Pressable>
        </View>
        <Pressable onPress={app.logout} style={styles.logoutBtn}><LogoutIcon /></Pressable>
      </View>

      <View style={styles.strengthCard}>
        <View style={styles.strengthTop}>
          <Text style={styles.strengthLabel}>profile strength</Text>
          <Text style={styles.strengthPct}>{me.profileStrength}%</Text>
        </View>
        <View style={styles.strengthTrack}><View style={[styles.strengthFill, { width: `${me.profileStrength}%` }]} /></View>
        <Text style={styles.strengthHint}>{nextStepHint(me)}</Text>
      </View>

      <View style={styles.sectionHead}><View style={[styles.dot, { backgroundColor: COLORS.amber }]} /><Text style={styles.sectionLabel}>your photos</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 14 }}>
        {me.photos.map(p => (
          <View key={p.id} style={styles.photoThumb}>
            <Image source={{ uri: mediaUrl(p.url)! }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Pressable onPress={() => void app.deletePhoto(p.id)} style={styles.photoRemove}><Text style={{ color: '#fff', fontSize: 12 }}>×</Text></Pressable>
          </View>
        ))}
        <Pressable onPress={pickPhoto} style={styles.photoAdd}>
          {uploading ? <ActivityIndicator color={COLORS.inkFaint} /> : <Text style={{ fontSize: 22, color: COLORS.inkFaint }}>+</Text>}
        </Pressable>
      </ScrollView>

      <View style={styles.sectionHead}><View style={[styles.dot, { backgroundColor: COLORS.teal }]} /><Text style={styles.sectionLabel}>voice intro</Text></View>
      <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
        {me.voiceUrl && !recorder.result && (
          <View style={styles.voiceCard}>
            <Pressable onPress={myVoice.toggle} style={styles.voicePlayBtn}>
              {myVoice.playing
                ? <View style={{ flexDirection: 'row', gap: 3 }}><View style={{ width: 3, height: 14, backgroundColor: '#fff' }} /><View style={{ width: 3, height: 14, backgroundColor: '#fff' }} /></View>
                : <View style={{ width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 11, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff' }} />}
            </Pressable>
            <Text style={styles.voiceCardText}>your voice intro</Text>
            <Pressable onPress={() => void app.deleteVoice()}><Text style={styles.voiceRemove}>remove</Text></Pressable>
          </View>
        )}
        {!me.voiceUrl && !recorder.result && !recorder.recording && (
          <Pressable onPress={() => void recorder.start()} style={styles.dashedBox}><Text style={styles.dashedText}>+ record a voice intro</Text></Pressable>
        )}
        {recorder.recording && (
          <Pressable onPress={() => void recorder.stop()} style={styles.recordingBox}>
            <View style={styles.recDot} />
            <Text style={styles.recordingText}>recording… tap to stop</Text>
          </Pressable>
        )}
        {recorder.result && (
          <View style={styles.recordedRow}>
            <Text style={styles.recordedText}>got it — {Math.round(recorder.result.durationSec)}s recorded</Text>
            <Pressable onPress={recorder.reset}><Text style={styles.discardText}>discard</Text></Pressable>
            <Pressable onPress={() => void saveVoice()}><Text style={styles.saveVoiceText}>save</Text></Pressable>
          </View>
        )}
        {recorder.error && <Text style={styles.recError}>{recorder.error}</Text>}
      </View>

      <View style={styles.sectionHead}><View style={[styles.dot, { backgroundColor: COLORS.pink }]} /><Text style={styles.sectionLabel}>your prompts</Text></View>
      <View style={{ marginHorizontal: 16, gap: 10, marginBottom: 14 }}>
        {me.prompts.map((p, i) => (
          <Pressable key={p.id ?? i} onPress={() => setEditPromptIdx(i)} style={styles.promptCard}>
            <Text style={styles.promptQ}>{p.question}</Text>
            <Text style={styles.promptA}>{p.answer}</Text>
          </Pressable>
        ))}
        {me.prompts.length < 3 && (
          <Pressable onPress={() => setEditPromptIdx(me.prompts.length)} style={styles.dashedBox}><Text style={styles.dashedText}>+ add a prompt</Text></Pressable>
        )}
      </View>

      <View style={styles.sectionHead}><View style={[styles.dot, { backgroundColor: COLORS.teal }]} /><Text style={styles.sectionLabel}>the non-negotiables</Text></View>
      <View style={styles.prefGrid}>
        {PREF_META.map(({ field, label, placeholder }) => (
          <Pressable key={field} onPress={() => setEditField({ field, title: label, value: me[field], placeholder })} style={styles.prefTile}>
            <Text style={styles.prefLabel}>{label}</Text>
            <Text style={[styles.prefValue, !me[field] && { color: '#B7AA92' }]}>{me[field] || 'tap to set'}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={confirmDeleteAccount} style={styles.deleteAccountLink}>
        <Text style={styles.deleteAccountText}>delete my account</Text>
      </Pressable>

      {editField && (
        <EditFieldModal
          title={editField.title}
          value={editField.value}
          placeholder={editField.placeholder}
          onClose={() => setEditField(null)}
          onSave={async v => { await app.updateProfileField(editField.field, v) }}
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 6, marginBottom: 10 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 62, height: 76, borderRadius: 18, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  avatarMono: { fontFamily: FONTS.display, fontSize: 25, color: '#fff' },
  verifyBadge: { position: 'absolute', bottom: -6, right: -6, backgroundColor: COLORS.screenBg, borderRadius: 12, padding: 2 },
  name: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink, letterSpacing: -0.8 },
  sub: { fontSize: 12, color: COLORS.inkFaint, marginTop: 2 },
  logoutBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  strengthCard: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink },
  strengthTop: { flexDirection: 'row', justifyContent: 'space-between' },
  strengthLabel: { fontSize: 13.5, fontFamily: FONTS.bodyBold, color: COLORS.ink },
  strengthPct: { fontSize: 14, fontFamily: FONTS.bodyHeavy, color: COLORS.teal },
  strengthTrack: { height: 10, borderRadius: 5, backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.ink, marginTop: 8, overflow: 'hidden' },
  strengthFill: { height: '100%', backgroundColor: COLORS.pink },
  strengthHint: { fontSize: 11.5, color: COLORS.inkFaint, marginTop: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 20, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.ink },
  sectionLabel: { fontSize: 11, color: COLORS.inkFaint, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: FONTS.bodyBold },
  photoThumb: { width: 76, height: 96, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.ink },
  photoRemove: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(18,13,8,.75)', alignItems: 'center', justifyContent: 'center' },
  photoAdd: { width: 76, height: 96, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(32,24,18,.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  dashedBox: { padding: 14, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(32,24,18,.3)', borderStyle: 'dashed', alignItems: 'center' },
  dashedText: { fontSize: 12.5, color: COLORS.inkFaint },
  voiceCard: { padding: 14, borderRadius: 20, backgroundColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', gap: 12 },
  voicePlayBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.pink, alignItems: 'center', justifyContent: 'center' },
  voiceCardText: { flex: 1, color: '#fff', fontSize: 13, fontFamily: FONTS.bodyBold },
  voiceRemove: { color: 'rgba(255,255,255,.6)', fontSize: 11.5, fontFamily: FONTS.bodyBold },
  recordingBox: { padding: 14, borderRadius: 20, backgroundColor: COLORS.pink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  recDot: { width: 10, height: 10, borderRadius: 3, backgroundColor: '#fff' },
  recordingText: { color: '#fff', fontSize: 13, fontFamily: FONTS.bodyHeavy },
  recordedRow: { padding: 14, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordedText: { flex: 1, fontSize: 12.5, color: COLORS.ink, fontFamily: FONTS.bodySemi },
  discardText: { fontSize: 11.5, fontFamily: FONTS.bodyBold, color: COLORS.inkFaint },
  saveVoiceText: { fontSize: 11.5, fontFamily: FONTS.bodyHeavy, color: COLORS.pink },
  recError: { fontSize: 11, color: COLORS.pink, marginTop: 6 },
  promptCard: { padding: 14, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink },
  promptQ: { fontSize: 9.5, color: COLORS.pink, fontFamily: FONTS.bodyHeavy, textTransform: 'uppercase', letterSpacing: 0.5 },
  promptA: { fontFamily: FONTS.displaySemi, fontSize: 15, color: COLORS.ink, marginTop: 4 },
  prefGrid: { marginHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  prefTile: { width: '47%', padding: 13, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink },
  prefLabel: { fontSize: 11, color: COLORS.inkFaint },
  prefValue: { fontSize: 14, color: COLORS.ink, fontFamily: FONTS.bodyBold, marginTop: 3 },
  deleteAccountLink: { alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
  deleteAccountText: { fontSize: 12, color: COLORS.inkFaint, textDecorationLine: 'underline' },
})
