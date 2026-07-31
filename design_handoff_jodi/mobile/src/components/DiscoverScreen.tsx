import { LinearGradient } from 'expo-linear-gradient'
import { useRef } from 'react'
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { mediaUrl } from '../api'
import { HeartIcon, PassIcon, PinIcon, RoseIcon, UndoIcon, VerifiedBadge } from '../icons'
import { COLORS, FONTS, parseGradient } from '../theme'
import { formatDuration, useSoundPlayer } from '../useSoundPlayer'
import type { JodiApp } from '../useJodiApp'
import { Image } from 'expo-image'

const SWIPE_THRESHOLD = 100

function VoicePill({ url, durationSec }: { url: string; durationSec: number | null }) {
  const { playing, toggle } = useSoundPlayer(url)
  return (
    <Pressable onPress={toggle} style={styles.voicePill} hitSlop={8}>
      <View style={styles.voicePillIcon}>
        {playing ? <View style={{ flexDirection: 'row', gap: 2 }}><View style={{ width: 3, height: 10, backgroundColor: COLORS.pink }} /><View style={{ width: 3, height: 10, backgroundColor: COLORS.pink }} /></View> : <View style={{ marginLeft: 1 }}><PinPlayGlyph /></View>}
      </View>
      <View style={styles.waveBars}>
        {[8, 14, 10, 17].map((h, i) => <View key={i} style={{ width: 2.5, height: h, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.85)' }} />)}
      </View>
      <Text style={styles.voicePillText}>{formatDuration(durationSec)}</Text>
    </Pressable>
  )
}
function PinPlayGlyph() {
  return <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: COLORS.pink }} />
}

export default function DiscoverScreen({ app }: { app: JodiApp }) {
  const pan = useRef(new Animated.ValueXY()).current
  const moved = useRef(false)
  const insets = useSafeAreaInsets()

  if (!app.isDiscover) return null

  const flingAndCommit = (dir: 'like' | 'pass' | 'rose') => {
    const toX = dir === 'pass' ? -520 : dir === 'rose' ? 0 : 520
    const toY = dir === 'rose' ? -640 : -30
    Animated.timing(pan, { toValue: { x: toX, y: toY }, duration: 280, useNativeDriver: true }).start(() => {
      pan.setValue({ x: 0, y: 0 })
      if (dir === 'like') app.likeCurrent()
      else if (dir === 'pass') app.passCurrent()
      else app.roseCurrent()
    })
  }

  // Not wrapped in useRef: it must be recreated each render so its handlers
  // close over the current render's `app` (deckIndex etc.), not whatever was
  // current the first time this component happened to render.
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
    onPanResponderGrant: () => { moved.current = false },
    onPanResponderMove: (_, g) => {
      if (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6) moved.current = true
      pan.setValue({ x: g.dx, y: g.dy })
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) { flingAndCommit('like'); return }
      if (g.dx < -SWIPE_THRESHOLD) { flingAndCommit('pass'); return }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true, friction: 6 }).start()
      if (!moved.current) app.openDetail()
    },
  })

  const rotate = pan.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-18deg', '0deg', '18deg'] })
  const likeOpacity = pan.x.interpolate({ inputRange: [0, 90], outputRange: [0, 1], extrapolate: 'clamp' })
  const passOpacity = pan.x.interpolate({ inputRange: [-90, 0], outputRange: [1, 0], extrapolate: 'clamp' })

  const photoUrl = mediaUrl(app.profile?.photos[0]?.url ?? null)
  const [gradA, gradB] = app.profile ? parseGradient(app.profile.grad) : ['#E5326E', '#8E1247']

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoDotPink} />
          <View style={[styles.logoDotAmber, { marginLeft: -6 }]} />
          <Text style={styles.brandText}>jodi</Text>
        </View>
        <View style={styles.filterBtn}><Text>☰</Text></View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>five for today</Text>
        <Text style={styles.subtitle}>no endless scroll. just five. · {app.remainingLabel}</Text>
      </View>

      <View style={styles.dotsRow}>
        {app.progressDots.map((d, i) => (
          <View key={i} style={styles.dotCol}>
            <View style={styles.dotLine} />
            <View style={[styles.dotOuter, { backgroundColor: d.color }]}>
              <View style={[styles.dotInner, { backgroundColor: d.core }]} />
            </View>
          </View>
        ))}
      </View>

      {app.deckLoading && (
        <View style={styles.centerFill}><Text style={styles.loadingText}>finding your five…</Text></View>
      )}

      {!app.deckLoading && app.hasDeck && app.profile && (
        <View style={styles.deckArea}>
          {app.nextProfile && (
            <View style={[styles.ghostCard, { backgroundColor: parseGradient(app.nextProfile.grad)[0] }]} />
          )}

          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.cardWrap, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
          >
            <View style={styles.card}>
              {photoUrl
                ? <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                : <LinearGradient colors={[gradA, gradB]} style={StyleSheet.absoluteFill} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} />}
              {!photoUrl && (
                <View style={styles.placeholderBox}><Text style={styles.placeholderText}>PORTRAIT · 4:5</Text></View>
              )}

              <View style={styles.matchBadge}>
                <View style={styles.matchDot} />
                <Text style={styles.matchBadgeText}>{app.profile.score}% match</Text>
              </View>

              <Animated.Text style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>fr</Animated.Text>
              <Animated.Text style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}>nah</Animated.Text>

              <View style={styles.cardFooter}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{app.profile.name}</Text>
                  <Text style={styles.age}>{app.profile.age}</Text>
                  {app.profile.verified && <VerifiedBadge />}
                </View>
                {!!app.profile.city && (
                  <View style={styles.cityRow}>
                    <PinIcon />
                    <Text style={styles.cityText}>{app.profile.city}</Text>
                  </View>
                )}
                <View style={styles.chipsRow}>
                  {app.profile.chips.map((chip, i) => (
                    <View key={i} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
                  ))}
                </View>
                {app.profile.prompts[0] && (
                  <View style={styles.promptCard}>
                    <Text style={styles.promptQ}>{app.profile.prompts[0].question}</Text>
                    <Text style={styles.promptA}>{app.profile.prompts[0].answer}</Text>
                  </View>
                )}
                <View style={styles.voiceRow}>
                  {app.profile.voiceUrl && <VoicePill url={app.profile.voiceUrl} durationSec={app.profile.voiceDurationSec} />}
                  <Text style={styles.tapMore}>tap for more →</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable onPress={app.undoCard} style={[styles.roundBtn, styles.undoBtn, { opacity: app.undoOpacity }]}><UndoIcon /></Pressable>
              <Pressable onPress={() => flingAndCommit('pass')} style={[styles.roundBtn, styles.passBtn]}><PassIcon /></Pressable>
              <Pressable onPress={() => flingAndCommit('rose')} style={[styles.roundBtn, styles.roseBtn]}><RoseIcon /></Pressable>
              <Pressable onPress={() => flingAndCommit('like')} style={[styles.roundBtn, styles.likeBtn]}><HeartIcon size={27} /></Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {app.deckEnded && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><HeartIcon size={32} color={COLORS.ink} outline /></View>
          <Text style={styles.emptyTitle}>that's your five</Text>
          <Text style={styles.emptyBody}>five people worth meeting {'>'} five hundred to scroll past. check back once more of the community joins, or run today's five back.</Text>
          <Pressable onPress={() => void app.resetDeck()} style={styles.resetBtn}><Text style={styles.resetBtnText}>run it back</Text></Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDotPink: { width: 15, height: 15, borderRadius: 8, backgroundColor: COLORS.pink },
  logoDotAmber: { width: 15, height: 15, borderRadius: 8, backgroundColor: COLORS.amber, opacity: 0.9 },
  brandText: { fontFamily: FONTS.display, fontSize: 19, color: COLORS.ink, letterSpacing: -0.7 },
  filterBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { paddingHorizontal: 20, marginTop: 10 },
  title: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.ink, letterSpacing: -1.2 },
  subtitle: { fontSize: 12, color: COLORS.inkFaint, marginTop: 5 },
  dotsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 12, marginBottom: 4 },
  dotCol: { flex: 1, alignItems: 'center' },
  dotLine: { width: '100%', height: 1.5, backgroundColor: 'rgba(32,24,18,.16)' },
  dotOuter: { width: 15, height: 15, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.ink, marginTop: -1, alignItems: 'center', justifyContent: 'center' },
  dotInner: { width: 5, height: 5, borderRadius: 3 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 13, color: COLORS.inkFaint },
  deckArea: { flex: 1, marginHorizontal: 18, position: 'relative' },
  ghostCard: { position: 'absolute', left: 16, right: 16, top: 16, bottom: 74, borderRadius: 30, opacity: 0.35, transform: [{ rotate: '2deg' }] },
  cardWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  card: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 74, borderRadius: 32, overflow: 'hidden', backgroundColor: '#120d08', borderWidth: 2.5, borderColor: COLORS.ink },
  placeholderBox: { position: 'absolute', left: 0, right: 0, top: '22%', alignItems: 'center' },
  placeholderText: { borderWidth: 1, borderColor: 'rgba(255,255,255,.4)', borderStyle: 'dashed', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, color: 'rgba(255,255,255,.66)', fontSize: 10, letterSpacing: 1.2 },
  matchBadge: { position: 'absolute', top: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.amber, borderWidth: 2, borderColor: COLORS.ink, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  matchDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.ink },
  matchBadgeText: { fontSize: 11.5, fontFamily: FONTS.bodyHeavy, color: COLORS.ink },
  stamp: { position: 'absolute', top: 122, fontFamily: FONTS.display, fontSize: 27, borderWidth: 3.5, borderRadius: 12, paddingVertical: 2, paddingHorizontal: 14 },
  stampLike: { left: 16, color: COLORS.green, borderColor: COLORS.green, transform: [{ rotate: '-13deg' }] },
  stampPass: { right: 16, color: COLORS.rosePass, borderColor: COLORS.rosePass, transform: [{ rotate: '13deg' }] },
  cardFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 16, backgroundColor: 'rgba(18,13,8,.55)' },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  name: { fontFamily: FONTS.display, fontSize: 27, color: '#fff', letterSpacing: -1 },
  age: { fontSize: 18, color: 'rgba(255,255,255,.9)', fontFamily: FONTS.bodySemi },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  cityText: { color: 'rgba(255,255,255,.8)', fontSize: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,.25)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 20 },
  chipText: { fontSize: 10.5, fontFamily: FONTS.bodySemi, color: 'rgba(255,255,255,.95)' },
  promptCard: { marginTop: 10, backgroundColor: COLORS.screenBg, borderRadius: 16, padding: 12, borderWidth: 2, borderColor: COLORS.ink },
  promptQ: { fontSize: 9.5, color: COLORS.pink, fontFamily: FONTS.bodyHeavy, textTransform: 'uppercase', letterSpacing: 0.5 },
  promptA: { fontFamily: FONTS.displaySemi, fontSize: 14.5, color: COLORS.ink, marginTop: 3 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 9 },
  voicePill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,.26)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 22 },
  voicePillIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  waveBars: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  voicePillText: { fontSize: 10.5, color: '#fff', fontFamily: FONTS.bodyBold },
  tapMore: { fontSize: 10.5, color: 'rgba(255,255,255,.62)', fontFamily: FONTS.bodySemi },
  actionsRow: { position: 'absolute', left: 0, right: 0, bottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  roundBtn: { alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  undoBtn: { width: 44, height: 44, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.ink },
  passBtn: { width: 54, height: 54, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink },
  roseBtn: { width: 54, height: 54, backgroundColor: COLORS.teal, borderWidth: 2, borderColor: COLORS.ink },
  likeBtn: { width: 64, height: 64, backgroundColor: COLORS.pink, borderWidth: 2, borderColor: COLORS.ink },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 42, gap: 12 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.amber, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: FONTS.display, fontSize: 23, color: COLORS.ink, letterSpacing: -0.8 },
  emptyBody: { fontSize: 13, color: COLORS.inkFaint, textAlign: 'center', lineHeight: 19 },
  resetBtn: { marginTop: 4, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 24, backgroundColor: COLORS.ink },
  resetBtnText: { color: '#fff', fontSize: 13, fontFamily: FONTS.bodyBold },
})
