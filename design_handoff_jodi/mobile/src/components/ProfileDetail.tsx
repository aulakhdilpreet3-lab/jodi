import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { mediaUrl } from '../api'
import { BackChevron, HeartIcon, PassIcon, RoseIcon, ShieldIcon, VerifiedBadge } from '../icons'
import { formatDuration, useSoundPlayer } from '../useSoundPlayer'
import { COLORS, FONTS, parseGradient } from '../theme'
import type { JodiApp } from '../useJodiApp'

const REPORT_REASONS = ['fake profile', 'inappropriate photos', 'harassment', 'something else']

export default function ProfileDetail({ app }: { app: JodiApp }) {
  const insets = useSafeAreaInsets()
  const [reporting, setReporting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const voice = useSoundPlayer(app.detail?.voiceUrl ?? null)

  if (!app.showDetail || !app.detail) return null
  const detail = app.detail
  const photoUrl = mediaUrl(detail.photos[0]?.url ?? null)
  const [a, b] = parseGradient(detail.grad)

  const submitReport = async (reason: string) => {
    setReporting(false)
    await app.reportProfile(detail.id, reason)
    await app.blockProfile(detail.id)
    setStatus("reported — you won't see them again")
    setTimeout(() => app.closeDetail(), 900)
  }
  const block = async () => {
    await app.blockProfile(detail.id)
    setStatus('blocked')
    setTimeout(() => app.closeDetail(), 700)
  }

  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 12 }}>
          <View style={styles.hero}>
            {photoUrl
              ? <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              : <LinearGradient colors={[a, b]} style={StyleSheet.absoluteFill} />}
            {detail.score > 0 && (
              <View style={styles.matchBadge}><View style={styles.matchDot} /><Text style={styles.matchBadgeText}>{detail.score}% match</Text></View>
            )}
            <View style={styles.heroFooter}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{detail.name}</Text>
                {detail.age > 0 && <Text style={styles.age}>{detail.age}</Text>}
                {detail.verified && <VerifiedBadge size={16} />}
              </View>
              {!!detail.city && <Text style={styles.city}>{detail.city}</Text>}
              <View style={styles.chipsRow}>
                {detail.chips.map((chip, i) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>)}
              </View>
            </View>
          </View>
          <Pressable onPress={app.closeDetail} style={styles.closeBtn}><BackChevron /></Pressable>
        </View>

        {app.detailCompat.length > 0 && (
          <View style={styles.compatCard}>
            <View style={styles.sectionHead}><View style={[styles.dot, { backgroundColor: COLORS.amber }]} /><Text style={styles.sectionLabel}>why you'd get along</Text></View>
            <View style={{ gap: 11, marginTop: 12 }}>
              {app.detailCompat.map(c => (
                <View key={c.key}>
                  <View style={styles.compatRow}><Text style={styles.compatK}>{c.label}</Text><Text style={styles.compatV}>{c.value}</Text></View>
                  <View style={styles.compatTrack}><View style={[styles.compatFill, { width: c.width as `${number}%`, backgroundColor: c.color }]} /></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {detail.voiceUrl && (
          <Pressable onPress={voice.toggle} style={styles.voiceCard}>
            <View style={styles.voiceIcon}>{voice.playing ? <View style={{ flexDirection: 'row', gap: 3 }}><View style={{ width: 3, height: 14, backgroundColor: '#fff' }} /><View style={{ width: 3, height: 14, backgroundColor: '#fff' }} /></View> : <View style={{ width: 0, height: 0, borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 11, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff' }} />}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.voiceTitle}>voice intro</Text>
              <Text style={styles.voiceSub}>hear how {detail.name} actually sounds · {formatDuration(detail.voiceDurationSec)}</Text>
            </View>
          </Pressable>
        )}

        {app.detailPrompts.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={[styles.dot, { backgroundColor: COLORS.pink }]} />
              <Text style={styles.sectionLabel}>prompts{app.detailIsDeckCard ? ' · heart one to reply' : ''}</Text>
            </View>
            <View style={{ marginHorizontal: 16, gap: 11, marginTop: 8 }}>
              {app.detailPrompts.map((p, i) => (
                <View key={i} style={styles.promptCard}>
                  <Text style={styles.promptQ}>{p.q}</Text>
                  <Text style={styles.promptA}>{p.a}</Text>
                  {app.detailIsDeckCard && (
                    <Pressable onPress={app.detailLike} style={styles.promptHeart}><HeartIcon size={17} color={COLORS.pink} outline /></Pressable>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.reportRow}>
          <ShieldIcon />
          <Text style={styles.reportText}>{status ?? (detail.verified ? 'photo + ID verified by jodi. something feel off?' : 'not yet verified. something feel off?')}</Text>
          {!status && !reporting && (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <Pressable onPress={() => void block()}><Text style={styles.blockLink}>block</Text></Pressable>
              <Pressable onPress={() => setReporting(true)}><Text style={styles.reportLink}>report</Text></Pressable>
            </View>
          )}
          {reporting && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: '100%' }}>
              {REPORT_REASONS.map(r => (
                <Pressable key={r} onPress={() => void submitReport(r)} style={styles.reasonChip}><Text style={styles.reasonChipText}>{r}</Text></Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {app.detailIsDeckCard && (
        <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Pressable onPress={app.detailPass} style={[styles.roundBtn, styles.passBtn]}><PassIcon size={19} /></Pressable>
          <Pressable onPress={app.detailRose} style={[styles.roundBtn, styles.roseBtn]}><RoseIcon size={20} /></Pressable>
          <Pressable onPress={app.detailLike} style={styles.sayHiBtn}>
            <HeartIcon size={21} />
            <Text style={styles.sayHiText}>say hi</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 45, backgroundColor: COLORS.chatBg },
  hero: { height: 380, borderRadius: 40, overflow: 'hidden', borderWidth: 2.5, borderColor: COLORS.ink },
  matchBadge: { position: 'absolute', top: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.amber, borderWidth: 2, borderColor: COLORS.ink, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  matchDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.ink },
  matchBadgeText: { fontSize: 11.5, fontFamily: FONTS.bodyHeavy, color: COLORS.ink },
  heroFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, backgroundColor: 'rgba(18,13,8,.55)' },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  name: { fontFamily: FONTS.display, fontSize: 29, color: '#fff', letterSpacing: -1.2 },
  age: { fontSize: 19, color: 'rgba(255,255,255,.9)', fontFamily: FONTS.bodySemi },
  city: { color: 'rgba(255,255,255,.82)', fontSize: 12.5, marginTop: 5 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  chip: { backgroundColor: 'rgba(255,255,255,.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,.25)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 20 },
  chipText: { fontSize: 10.5, fontFamily: FONTS.bodySemi, color: 'rgba(255,255,255,.95)' },
  closeBtn: { position: 'absolute', top: 20, left: 28, width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.screenBg, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  compatCard: { margin: 16, padding: 17, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 20, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.ink },
  sectionLabel: { fontSize: 11, color: COLORS.inkFaint, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: FONTS.bodyBold },
  compatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  compatK: { fontSize: 13, color: COLORS.ink, fontFamily: FONTS.bodyBold },
  compatV: { fontSize: 12, color: COLORS.inkFaint },
  compatTrack: { height: 9, borderRadius: 5, backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.ink, marginTop: 6, overflow: 'hidden' },
  compatFill: { height: '100%' },
  voiceCard: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 24, backgroundColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', gap: 13 },
  voiceIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.pink, alignItems: 'center', justifyContent: 'center' },
  voiceTitle: { color: '#fff', fontSize: 13.5, fontFamily: FONTS.bodyBold },
  voiceSub: { color: 'rgba(255,255,255,.57)', fontSize: 11.5, marginTop: 1 },
  promptCard: { padding: 16, paddingRight: 58, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink, position: 'relative' },
  promptQ: { fontSize: 9.5, color: COLORS.pink, fontFamily: FONTS.bodyHeavy, textTransform: 'uppercase', letterSpacing: 0.5 },
  promptA: { fontFamily: FONTS.displaySemi, fontSize: 16, color: COLORS.ink, marginTop: 5, lineHeight: 21 },
  promptHeart: { position: 'absolute', right: 13, bottom: 13, width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.screenBg, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  reportRow: { margin: 16, padding: 15, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(32,24,18,.24)', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 11, flexWrap: 'wrap' },
  reportText: { flex: 1, fontSize: 12, color: COLORS.inkFaint, lineHeight: 17, minWidth: 140 },
  blockLink: { fontSize: 12, fontFamily: FONTS.bodyBold, color: COLORS.ink },
  reportLink: { fontSize: 12, fontFamily: FONTS.bodyBold, color: COLORS.pink },
  reasonChip: { backgroundColor: COLORS.screenBg, borderWidth: 1.5, borderColor: COLORS.ink, borderRadius: 14, paddingVertical: 5, paddingHorizontal: 10 },
  reasonChipText: { fontSize: 11, fontFamily: FONTS.bodyBold, color: COLORS.ink },
  actionBar: { backgroundColor: COLORS.screenBg, borderTopWidth: 1.5, borderTopColor: 'rgba(32,24,18,.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13, paddingTop: 12, paddingHorizontal: 18 },
  roundBtn: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.ink },
  passBtn: { backgroundColor: COLORS.card },
  roseBtn: { backgroundColor: COLORS.teal },
  sayHiBtn: { flex: 1, height: 54, borderRadius: 27, backgroundColor: COLORS.pink, borderWidth: 2, borderColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  sayHiText: { color: '#fff', fontSize: 15.5, fontFamily: FONTS.bodyHeavy },
})
