import {
  useRef, useState,
  type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  CHAT_DATA, CHAT_LIST_FALLBACK, EXTRAS, INITIAL_THREADS, LIKES_DATA, ME_PREFS, PROFILES, REPLY_BANK,
} from './data'
import type { ChatMessage, DragState, FlingDir, FlingState, Profile, Tab } from './types'

const clamp = (v: number) => Math.max(0, Math.min(1, v))

interface State {
  tab: Tab
  deckIndex: number
  drag: DragState
  fling: FlingState | null
  matchProfile: Profile | null
  detail: Profile | null
  chatWith: { name: string; mono: string; grad: string } | null
  prevTab: Tab
  draft: string
  typing: boolean
  threads: Record<string, ChatMessage[]>
}

const INITIAL_STATE: State = {
  tab: 'discover',
  deckIndex: 0,
  drag: { x: 0, y: 0, active: false },
  fling: null,
  matchProfile: null,
  detail: null,
  chatWith: null,
  prevTab: 'matches',
  draft: '',
  typing: false,
  threads: INITIAL_THREADS,
}

export function useJodiApp() {
  const [s, setS] = useState<State>(INITIAL_STATE)

  const dragStart = useRef({ x: 0, y: 0 })
  const moved = useRef(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>()
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>()
  const matchTimer = useRef<ReturnType<typeof setTimeout>>()

  const patch = (p: Partial<State> | ((prev: State) => Partial<State>)) =>
    setS(prev => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }))

  // ---- deck drag / fling ----
  const onCardDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
    dragStart.current = { x: e.clientX, y: e.clientY }
    moved.current = false
    patch({ drag: { x: 0, y: 0, active: true } })
  }
  const onCardMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!s.drag.active) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true
    patch({ drag: { x: dx, y: dy, active: true } })
  }
  const onCardUp = () => {
    const dx = s.drag.x
    if (dx > 95) { doLike(); return }
    if (dx < -95) { doPass(); return }
    patch({ drag: { x: 0, y: 0, active: false } })
    if (!moved.current) openDetail()
  }

  const advance = (dir: FlingDir, checkMatch: boolean, rose: boolean) => {
    const p = PROFILES[s.deckIndex]
    patch({ fling: { dir }, drag: { x: 0, y: 0, active: false } })
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      patch(prev => ({ fling: null, deckIndex: prev.deckIndex + 1, drag: { x: 0, y: 0, active: false } }))
      if (checkMatch && p && (p.mutual || rose)) {
        clearTimeout(matchTimer.current)
        matchTimer.current = setTimeout(() => patch({ matchProfile: p }), 60)
      }
    }, 340)
  }
  const doLike = () => advance('like', true, false)
  const doPass = () => advance('pass', false, false)
  const sendRose = () => advance('rose', true, true)
  const resetDeck = () => patch({ deckIndex: 0 })
  const undoCard = () => patch(prev => ({ deckIndex: Math.max(0, prev.deckIndex - 1), fling: null, drag: { x: 0, y: 0, active: false } }))

  // ---- profile detail ----
  const openDetail = () => patch(prev => ({ detail: PROFILES[prev.deckIndex] ?? null }))
  const closeDetail = () => patch({ detail: null })
  const detailLike = () => { patch({ detail: null }); setTimeout(doLike, 60) }
  const detailPass = () => { patch({ detail: null }); setTimeout(doPass, 60) }
  const detailRose = () => { patch({ detail: null }); setTimeout(sendRose, 60) }

  // ---- match modal ----
  const closeMatch = () => patch({ matchProfile: null })
  const messageMatch = () => {
    patch(prev => {
      const p = prev.matchProfile
      if (!p) return {}
      const threads = { ...prev.threads }
      if (!threads[p.name]) {
        threads[p.name] = [{ me: false, text: 'hiii ok your prompt about ' + p.promptA.slice(0, 26) + '… got me' }]
      }
      return { matchProfile: null, chatWith: { name: p.name, mono: p.mono, grad: p.grad }, tab: 'chat', prevTab: 'matches', threads }
    })
  }

  // ---- chat ----
  const openChat = (name: string) => {
    const src = CHAT_DATA.find(c => c.name === name) ?? PROFILES.find(p => p.name === name)
    patch(prev => ({
      chatWith: { name, mono: name[0], grad: src?.grad ?? PROFILES[0].grad },
      tab: 'chat',
      prevTab: prev.tab === 'chat' ? prev.prevTab : prev.tab,
    }))
  }
  const backToMatches = () => patch(prev => ({ tab: prev.prevTab || 'matches' }))
  const onDraft = (e: ChangeEvent<HTMLInputElement>) => patch({ draft: e.target.value })
  const onDraftKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') sendMsg() }
  const sendMsg = () => {
    const t = s.draft.trim()
    if (!t) return
    const name = s.chatWith ? s.chatWith.name : 'Aisha'
    patch(prev => {
      const threads = { ...prev.threads }
      threads[name] = [...(threads[name] ?? []), { me: true, text: t }]
      return { threads, draft: '', typing: true }
    })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      const reply = REPLY_BANK[Math.floor(Math.random() * REPLY_BANK.length)]
      patch(prev => {
        const threads = { ...prev.threads }
        threads[name] = [...(threads[name] ?? []), { me: false, text: reply }]
        return { threads, typing: false }
      })
    }, 1600)
  }

  // ---- nav ----
  const goDiscover = () => patch({ tab: 'discover' })
  const goLikes = () => patch({ tab: 'likes' })
  const goMatches = () => patch({ tab: 'matches' })
  const goYou = () => patch({ tab: 'you' })

  // ---- derived render values (mirrors the original renderVals()) ----
  const idx = s.deckIndex
  const profile = PROFILES[idx] ?? PROFILES[0]
  const nextProfile = PROFILES[idx + 1] ?? PROFILES[0]
  const total = PROFILES.length
  const hasDeck = idx < total
  const { drag: d, fling: f } = s

  let tx: number, ty: number, rot: number, trans: string
  if (f) {
    tx = f.dir === 'pass' ? -600 : f.dir === 'rose' ? 0 : 600
    ty = f.dir === 'rose' ? -700 : -40
    rot = f.dir === 'pass' ? -22 : f.dir === 'rose' ? 0 : 22
    trans = 'transform .34s ease'
  } else {
    tx = d.x; ty = d.y; rot = d.x / 18
    trans = d.active ? 'none' : 'transform .3s cubic-bezier(.2,.8,.2,1)'
  }
  const topCardWrapStyle: CSSProperties = {
    position: 'absolute', inset: 0, touchAction: 'none', cursor: 'grab',
    transform: `translate(${tx}px,${ty}px) rotate(${rot}deg)`,
    transition: trans,
  }

  const dotCols = ['#E5326E', '#F5A524', '#16A6A0', '#7B3FA0', '#3B4CC0']
  const progressDots = PROFILES.map((_, i) => ({
    color: i < idx ? dotCols[i % dotCols.length] : i === idx ? '#F5A524' : '#EFE3CC',
    core: i <= idx ? 'rgba(32,24,18,.55)' : 'rgba(32,24,18,.2)',
  }))

  const likesYou = LIKES_DATA.map((l, i) => ({ ...l, blur: i === 0 ? 'blur(0px)' : 'blur(13px)' }))
  const newMatches = CHAT_DATA.map(c => c)

  const lastOf = (n: string) => { const t = s.threads[n] ?? []; return t[t.length - 1] }
  const snip = (n: string, fb: string) => { const m = lastOf(n); return m ? (m.me ? 'you: ' + m.text : m.text) : fb }
  const chats = [
    { name: 'Aisha', mono: 'A', grad: PROFILES[0].grad, online: true, time: 'now', unread: true, snippet: snip('Aisha', CHAT_LIST_FALLBACK.Aisha) },
    { name: 'Neha', mono: 'N', grad: CHAT_DATA[1].grad, online: false, time: '2h', unread: true, snippet: snip('Neha', CHAT_LIST_FALLBACK.Neha) },
    { name: 'Simran', mono: 'S', grad: CHAT_DATA[2].grad, online: true, time: '1d', unread: false, snippet: snip('Simran', CHAT_LIST_FALLBACK.Simran) },
  ].map(c => ({ ...c, snipColor: c.unread ? '#201812' : '#A69A85', snipWeight: c.unread ? 600 : 400 }))

  const cw = s.chatWith ?? { name: 'Aisha', mono: 'A', grad: PROFILES[0].grad }
  const chatMsgs = (s.threads[cw.name] ?? []).map(m => ({
    text: m.text,
    justify: m.me ? 'flex-end' : 'flex-start',
    bg: m.me ? '#E5326E' : '#FFFDF7',
    color: m.me ? '#fff' : '#201812',
    radius: m.me ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
  }))

  const det = s.detail ?? PROFILES[0]
  const ex = EXTRAS[det.name] ?? { prompts: [], compat: [] }
  const detailPrompts = ex.prompts
  const detailCompat = ex.compat.map(c => ({ k: c[0], v: c[1], width: c[2] + '%', color: c[2] < 65 ? '#F5A524' : '#E5326E' }))

  const navC = (t: Tab) => (s.tab === t ? '#E5326E' : '#A69A85')
  const navF = (t: Tab) => (s.tab === t ? '#E5326E' : 'none')
  const navW = (t: Tab) => (s.tab === t ? 800 : 600)
  const navB = (t: Tab) => (s.tab === t ? 'rgba(229,50,110,.12)' : 'transparent')

  const unreadCount = chats.filter(c => c.unread).length

  return {
    // tab visibility
    isDiscover: s.tab === 'discover', isLikes: s.tab === 'likes', isMatches: s.tab === 'matches',
    isChat: s.tab === 'chat', isYou: s.tab === 'you', showNav: s.tab !== 'chat',
    // discover
    profile, nextProfile, hasDeck, deckEnded: !hasDeck,
    topCardWrapStyle,
    likeOpacity: f ? (f.dir !== 'pass' ? 1 : 0) : clamp(d.x / 80),
    passOpacity: f ? (f.dir === 'pass' ? 1 : 0) : clamp(-d.x / 80),
    onCardDown, onCardMove, onCardUp,
    flingLike: doLike, flingPass: doPass, sendRose, resetDeck,
    undoCard, undoOpacity: idx > 0 ? 1 : 0.35,
    progressDots, remainingLabel: hasDeck ? `${total - idx} left` : 'all seen',
    // likes / crushes
    likesYou, likesCount: LIKES_DATA.length + 1,
    // matches / chats
    newMatches, chats, openChat,
    // chat thread
    chatWith: cw, chatMsgs, showTyping: s.typing && s.tab === 'chat',
    draft: s.draft, onDraft, onDraftKey, sendMsg,
    sendBg: s.draft.trim() ? '#E5326E' : '#cdbfa6',
    backToMatches,
    // me
    prefs: ME_PREFS,
    // nav
    goDiscover, goLikes, goMatches, goYou,
    navDiscover: navC('discover'), navDiscoverFill: navF('discover'), navDiscoverW: navW('discover'), navDiscoverBg: navB('discover'),
    navLikes: navC('likes'), navLikesFill: navF('likes'), navLikesW: navW('likes'), navLikesBg: navB('likes'),
    navMatches: navC('matches'), navMatchesFill: navF('matches'), navMatchesW: navW('matches'), navMatchesBg: navB('matches'),
    navYou: navC('you'), navYouFill: navF('you'), navYouW: navW('you'), navYouBg: navB('you'),
    hasUnread: unreadCount > 0, unreadCount,
    // match modal
    showMatch: !!s.matchProfile, matchProfile: s.matchProfile ?? PROFILES[0], closeMatch, messageMatch,
    // detail overlay
    showDetail: !!s.detail, detail: det, detailPrompts, detailCompat,
    closeDetail, detailLike, detailPass, detailRose,
  }
}

export type JodiApp = ReturnType<typeof useJodiApp>
