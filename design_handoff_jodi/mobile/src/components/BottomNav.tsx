import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChatsNavIcon, CrushesNavIcon, MeNavIcon, TodayNavIcon } from '../icons'
import { COLORS, FONTS } from '../theme'
import type { JodiApp } from '../useJodiApp'

export default function BottomNav({ app }: { app: JodiApp }) {
  const insets = useSafeAreaInsets()
  if (!app.showNav) return null

  const itemBg = (active: boolean) => (active ? 'rgba(229,50,110,.12)' : 'transparent')
  const itemColor = (active: boolean) => (active ? COLORS.pink : COLORS.inkMuted)

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <Pressable onPress={app.goDiscover} style={[styles.item, { backgroundColor: itemBg(app.navDiscover) }]}>
        <TodayNavIcon color={itemColor(app.navDiscover)} filled={app.navDiscover ? COLORS.pink : undefined} />
        <Text style={[styles.label, { color: itemColor(app.navDiscover), fontFamily: app.navDiscover ? FONTS.bodyHeavy : FONTS.bodySemi }]}>today</Text>
      </Pressable>

      <Pressable onPress={app.goLikes} style={[styles.item, { backgroundColor: itemBg(app.navLikes) }]}>
        <View>
          <CrushesNavIcon color={itemColor(app.navLikes)} filled={app.navLikes ? COLORS.pink : undefined} />
          <View style={styles.badge}><Text style={styles.badgeText}>{app.likesCount}</Text></View>
        </View>
        <Text style={[styles.label, { color: itemColor(app.navLikes), fontFamily: app.navLikes ? FONTS.bodyHeavy : FONTS.bodySemi }]}>crushes</Text>
      </Pressable>

      <Pressable onPress={app.goMatches} style={[styles.item, { backgroundColor: itemBg(app.navMatches) }]}>
        <View>
          <ChatsNavIcon color={itemColor(app.navMatches)} filled={app.navMatches ? COLORS.pink : undefined} />
          {app.hasUnread && <View style={styles.badge}><Text style={styles.badgeText}>{app.unreadCount}</Text></View>}
        </View>
        <Text style={[styles.label, { color: itemColor(app.navMatches), fontFamily: app.navMatches ? FONTS.bodyHeavy : FONTS.bodySemi }]}>chats</Text>
      </Pressable>

      <Pressable onPress={app.goYou} style={[styles.item, { backgroundColor: itemBg(app.navYou) }]}>
        <MeNavIcon color={itemColor(app.navYou)} filled={app.navYou ? COLORS.pink : undefined} />
        <Text style={[styles.label, { color: itemColor(app.navYou), fontFamily: app.navYou ? FONTS.bodyHeavy : FONTS.bodySemi }]}>me</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start',
    backgroundColor: 'rgba(251,243,228,.97)', paddingTop: 9, paddingHorizontal: 10, gap: 6,
    borderTopWidth: 1.5, borderTopColor: 'rgba(32,24,18,.1)',
  },
  item: { flex: 1, alignItems: 'center', gap: 3, borderRadius: 16, paddingVertical: 6 },
  label: { fontSize: 10 },
  badge: {
    position: 'absolute', top: -6, right: -10, backgroundColor: COLORS.pink, borderWidth: 1.5, borderColor: COLORS.ink,
    minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: FONTS.bodyHeavy },
})
