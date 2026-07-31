import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, FONTS, parseGradient } from '../theme'
import type { JodiApp } from '../useJodiApp'

export default function ChatsScreen({ app }: { app: JodiApp }) {
  const insets = useSafeAreaInsets()
  if (!app.isMatches) return null
  const empty = !app.matchesLoading && app.newMatches.length === 0 && app.chats.length === 0

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 90 }}>
      <Text style={styles.title}>chats</Text>

      {app.matchesLoading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.inkFaint} />}
      {empty && <Text style={styles.empty}>no jodis yet — swipe through today's five to find one.</Text>}

      {app.newMatches.length > 0 && (
        <View style={{ paddingBottom: 6 }}>
          <View style={styles.sectionHead}>
            <View style={[styles.dot, { backgroundColor: COLORS.amber }]} />
            <Text style={styles.sectionLabel}>your jodis</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
            {app.newMatches.map(nm => {
              const [a, b] = parseGradient(nm.user.grad)
              return (
                <Pressable key={nm.matchId} onPress={() => void app.openChat(nm.matchId, { ...nm.user, online: nm.online })} style={{ alignItems: 'center' }}>
                  <LinearGradient colors={[a, b]} style={styles.avatarTall}>
                    <Text style={styles.avatarMono}>{nm.user.mono}</Text>
                  </LinearGradient>
                  <Text style={styles.matchName}>{nm.user.name}</Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      )}

      {app.newMatches.length > 0 && app.chats.length > 0 && <View style={styles.divider} />}

      <View>
        {app.chats.map(c => {
          const [a, b] = parseGradient(c.user.grad)
          return (
            <Pressable key={c.matchId} onPress={() => void app.openChat(c.matchId, { ...c.user, online: c.online })} style={styles.chatRow}>
              <View>
                <LinearGradient colors={[a, b]} style={styles.avatarMed}>
                  <Text style={styles.avatarMonoMed}>{c.user.mono}</Text>
                </LinearGradient>
                {c.online && <View style={styles.onlineDot} />}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>{c.user.name}</Text>
                  <Text style={styles.chatTime}>{c.time}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.chatSnippet, { color: c.snipColor, fontFamily: c.snipWeight === '600' ? FONTS.bodySemi : FONTS.body }]}>{c.snippet}</Text>
              </View>
              {c.unread && <View style={styles.unreadDot} />}
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontFamily: FONTS.display, fontSize: 27, color: COLORS.ink, letterSpacing: -1.1, paddingHorizontal: 20, marginBottom: 8 },
  empty: { textAlign: 'center', color: COLORS.inkFaint, fontSize: 12.5, paddingHorizontal: 40, marginTop: 20, lineHeight: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 20, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.ink },
  sectionLabel: { fontSize: 11, color: COLORS.inkFaint, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: FONTS.bodyBold },
  avatarTall: { width: 64, height: 78, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.ink },
  avatarMono: { fontFamily: FONTS.display, fontSize: 22, color: 'rgba(255,255,255,.92)' },
  matchName: { fontSize: 11.5, color: COLORS.ink, marginTop: 5, fontFamily: FONTS.bodySemi },
  divider: { height: 1.5, backgroundColor: 'rgba(32,24,18,.1)', marginHorizontal: 20, marginVertical: 4 },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 20, paddingVertical: 10 },
  avatarMed: { width: 52, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.ink },
  avatarMonoMed: { fontFamily: FONTS.display, fontSize: 19, color: 'rgba(255,255,255,.92)' },
  onlineDot: { position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.teal, borderWidth: 2, borderColor: COLORS.screenBg },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  chatName: { fontSize: 15.5, fontFamily: FONTS.bodyBold, color: COLORS.ink },
  chatTime: { fontSize: 11, color: COLORS.inkMuted },
  chatSnippet: { fontSize: 13, marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.pink },
})
