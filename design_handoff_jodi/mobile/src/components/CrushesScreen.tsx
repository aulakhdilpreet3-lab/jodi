import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RoseIcon } from '../icons'
import { COLORS, FONTS, parseGradient } from '../theme'
import type { JodiApp } from '../useJodiApp'

export default function CrushesScreen({ app }: { app: JodiApp }) {
  const [notice, setNotice] = useState(false)
  const insets = useSafeAreaInsets()
  if (!app.isLikes) return null

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 90 }}>
      <View style={styles.header}>
        <Text style={styles.title}>who's into you</Text>
        <Text style={styles.subtitle}>
          {app.likesCount === 0 ? 'no one yet — keep swiping, your five will bring some' : `${app.likesCount} ${app.likesCount === 1 ? 'person' : 'people'} said hi. say hi back to unblur.`}
        </Text>
      </View>

      <Pressable onPress={() => setNotice(n => !n)} style={styles.goldBanner}>
        <View style={styles.goldIcon}><RoseIcon color={COLORS.ink} size={20} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.goldTitle}>see everyone at once</Text>
          <Text style={styles.goldSub}>{notice ? "payments aren't set up in this build yet" : 'jodi gold · unblur every crush'}</Text>
        </View>
        <View style={styles.goldBtn}><Text style={styles.goldBtnText}>get it</Text></View>
      </Pressable>

      {app.likesLoading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.inkFaint} />}

      <View style={styles.grid}>
        {app.likesYou.map((lk, i) => {
          const [a, b] = parseGradient(lk.user.grad)
          return (
            <Pressable
              key={lk.user.id}
              onPress={() => { if (i === 0) void app.likeBack(lk.user.id); else setNotice(true) }}
              style={styles.card}
            >
              <LinearGradient colors={[a, b]} style={StyleSheet.absoluteFill} />
              <View style={styles.cardFooter}>
                <Text style={styles.cardHint}>{lk.user.chips.slice(0, 2).join(' · ') || 'new to jodi'}</Text>
                <Text style={styles.cardCity}>{lk.user.city || (i === 0 ? 'tap to say hi back' : 'unlock to reveal')}</Text>
              </View>
              {lk.rose && (
                <View style={styles.roseTag}>
                  <RoseIcon size={10} />
                  <Text style={styles.roseTagText}>rose</Text>
                </View>
              )}
              {lk.blurred && <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />}
            </Pressable>
          )
        })}
      </View>

      {!app.likesLoading && app.likesYou.length === 0 && (
        <Text style={styles.empty}>nobody's said hi yet — swipe through today's five and check back later.</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 6 },
  title: { fontFamily: FONTS.display, fontSize: 27, color: COLORS.ink, letterSpacing: -1.1 },
  subtitle: { fontSize: 12, color: COLORS.inkFaint, marginTop: 4 },
  goldBanner: { marginHorizontal: 16, marginVertical: 10, borderRadius: 22, backgroundColor: COLORS.ink, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  goldIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.amber, alignItems: 'center', justifyContent: 'center' },
  goldTitle: { color: '#fff', fontSize: 14.5, fontFamily: FONTS.bodyBold },
  goldSub: { color: 'rgba(255,255,255,.62)', fontSize: 11.5, marginTop: 1 },
  goldBtn: { backgroundColor: COLORS.amber, paddingVertical: 9, paddingHorizontal: 15, borderRadius: 20 },
  goldBtnText: { color: COLORS.ink, fontSize: 12, fontFamily: FONTS.bodyHeavy },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 13 },
  card: { width: '47%', aspectRatio: 3 / 4, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.ink },
  cardFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 11, paddingTop: 24, backgroundColor: 'rgba(18,13,8,.5)' },
  cardHint: { color: '#fff', fontSize: 12.5, fontFamily: FONTS.bodyBold },
  cardCity: { color: 'rgba(255,255,255,.72)', fontSize: 10.5, marginTop: 1 },
  roseTag: { position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.teal, borderWidth: 1.5, borderColor: COLORS.ink, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 14, transform: [{ rotate: '-3deg' }] },
  roseTagText: { fontSize: 9.5, fontFamily: FONTS.bodyHeavy, color: '#fff' },
  empty: { textAlign: 'center', color: COLORS.inkFaint, fontSize: 12.5, paddingHorizontal: 40, marginTop: 20, lineHeight: 18 },
})
