import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackChevron, RoseIcon, SendIcon, VerifiedBadge } from '../icons'
import { COLORS, FONTS, parseGradient } from '../theme'
import type { JodiApp } from '../useJodiApp'

export default function ChatThreadScreen({ app }: { app: JodiApp }) {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [app.chatMsgs.length, app.showTyping])

  if (!app.isChat || !app.chatWith) return null
  const { user } = app.chatWith
  const [a, b] = parseGradient(user.grad)

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={app.backToMatches} style={styles.backBtn}><BackChevron /></Pressable>
        <Pressable onPress={app.openChatProfile} style={styles.headerInfo}>
          <LinearGradient colors={[a, b]} style={styles.avatar}><Text style={styles.avatarMono}>{user.mono}</Text></LinearGradient>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {user.verified && <VerifiedBadge size={13} />}
            </View>
            {user.online && <Text style={styles.activeNow}>active now</Text>}
          </View>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={styles.msgArea} contentContainerStyle={{ padding: 16, gap: 8 }}>
        <View style={styles.jodiBanner}>
          <RoseIcon size={12} color={COLORS.ink} />
          <Text style={styles.jodiBannerText}>it's a jodi · say hi</Text>
        </View>
        {app.chatMsgs.length === 0 && <Text style={styles.emptyThread}>you matched — break the ice.</Text>}
        {app.chatMsgs.map(m => (
          <View key={m.id} style={{ alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
            <View style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={{ color: m.mine ? '#fff' : COLORS.ink, fontSize: 14 }}>{m.text}</Text>
            </View>
          </View>
        ))}
        {app.showTyping && (
          <View style={{ alignItems: 'flex-start' }}>
            <View style={[styles.bubble, styles.bubbleTheirs, { flexDirection: 'row', gap: 4 }]}>
              <View style={styles.typingDot} /><View style={styles.typingDot} /><View style={styles.typingDot} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.inputWrap}>
          <TextInput
            value={app.draft}
            onChangeText={app.onDraft}
            onSubmitEditing={() => void app.sendMsg()}
            placeholder="say something…"
            placeholderTextColor="#B7AA92"
            style={styles.input}
            returnKeyType="send"
          />
          <Pressable onPress={() => void app.sendMsg()} style={[styles.sendBtn, { backgroundColor: app.draft.trim() ? COLORS.pink : '#cdbfa6' }]}>
            <SendIcon />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.screenBg, borderBottomWidth: 1.5, borderBottomColor: 'rgba(32,24,18,.1)', paddingBottom: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 32, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 38, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.ink },
  avatarMono: { fontFamily: FONTS.display, fontSize: 16, color: 'rgba(255,255,255,.92)' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 15.5, fontFamily: FONTS.bodyBold, color: COLORS.ink },
  activeNow: { fontSize: 11, color: COLORS.teal, fontFamily: FONTS.bodyBold },
  msgArea: { flex: 1, backgroundColor: COLORS.chatBg },
  jodiBanner: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, backgroundColor: COLORS.amber, borderWidth: 2, borderColor: COLORS.ink, paddingVertical: 5, paddingHorizontal: 13, borderRadius: 16, transform: [{ rotate: '-1.5deg' }], marginBottom: 4 },
  jodiBannerText: { fontSize: 11, fontFamily: FONTS.bodyHeavy, color: COLORS.ink },
  emptyThread: { textAlign: 'center', color: COLORS.inkFaint, fontSize: 12.5, marginTop: 20 },
  bubble: { maxWidth: '76%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ink },
  bubbleMine: { backgroundColor: COLORS.pink, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: COLORS.card, borderBottomLeftRadius: 6 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#b3a48c' },
  inputBar: { backgroundColor: COLORS.screenBg, borderTopWidth: 1.5, borderTopColor: 'rgba(32,24,18,.1)', paddingHorizontal: 12, paddingTop: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink, borderRadius: 26, paddingLeft: 16, paddingVertical: 5, paddingRight: 5 },
  input: { flex: 1, fontSize: 14.5, color: COLORS.ink, fontFamily: FONTS.body },
  sendBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
})
