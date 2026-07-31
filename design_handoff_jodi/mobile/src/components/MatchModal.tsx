import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { HeartIcon } from '../icons'
import { COLORS, FONTS, parseGradient } from '../theme'
import type { JodiApp } from '../useJodiApp'

export default function MatchModal({ app }: { app: JodiApp }) {
  if (!app.showMatch || !app.matchProfile || !app.me) return null
  const { matchProfile, me } = app
  const [meA, meB] = parseGradient(me.grad)
  const [themA, themB] = parseGradient(matchProfile.grad)

  return (
    <View style={styles.overlay}>
      <Text style={styles.noWay}>no way</Text>
      <Text style={styles.title}>it's a jodi</Text>
      <View style={styles.avatarsRow}>
        <LinearGradient colors={[meA, meB]} style={[styles.avatar, { zIndex: 2 }]}><Text style={styles.avatarText}>{me.mono}</Text></LinearGradient>
        <View style={styles.heartBadge}><HeartIcon size={20} color={COLORS.pink} /></View>
        <LinearGradient colors={[themA, themB]} style={[styles.avatar, { zIndex: 2 }]}><Text style={styles.avatarText}>{matchProfile.mono}</Text></LinearGradient>
      </View>
      <Text style={styles.copy}>you and {matchProfile.name} both said hi.{'\n'}break the ice.</Text>
      <View style={styles.buttons}>
        <Pressable onPress={app.messageMatch} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>start the convo</Text></Pressable>
        <Pressable onPress={app.closeMatch} style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>keep looking</Text></Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 70, backgroundColor: COLORS.pink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  noWay: { fontSize: 12, color: 'rgba(255,255,255,.88)', letterSpacing: 3, textTransform: 'uppercase', fontFamily: FONTS.bodyBold },
  title: { fontFamily: FONTS.display, fontSize: 44, color: '#fff', marginTop: 6, letterSpacing: -2 },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  avatar: { width: 92, height: 112, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: COLORS.ink },
  avatarText: { fontFamily: FONTS.display, fontSize: 34, color: '#fff' },
  heartBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.screenBg, borderWidth: 2.5, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', marginHorizontal: -13, zIndex: 3 },
  copy: { fontSize: 15, color: 'rgba(255,255,255,.95)', marginTop: 24, textAlign: 'center', lineHeight: 22 },
  buttons: { gap: 11, marginTop: 24, width: '100%' },
  primaryBtn: { padding: 16, borderRadius: 28, backgroundColor: COLORS.amber, borderWidth: 2.5, borderColor: COLORS.ink, alignItems: 'center' },
  primaryBtnText: { color: COLORS.ink, fontSize: 15.5, fontFamily: FONTS.bodyHeavy },
  secondaryBtn: { padding: 14, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(255,255,255,.55)', alignItems: 'center' },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontFamily: FONTS.bodyBold },
})
