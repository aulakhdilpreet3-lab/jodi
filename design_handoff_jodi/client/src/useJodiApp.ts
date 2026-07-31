import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { api } from './api'
import { useAuth } from './AuthContext'
import { getSocket } from './socket'
import type {
  ChatMessage, CompatRow, DeckCandidate, DragState, FlingDir, FlingState, LikeEntry, MatchSummary, MeUser, PublicUser, Tab,
} from './types'

const clamp = (v: number) => Math.max(0, Math.min(1, v))

type ChatPartner = Pick<PublicUser, 'id' | 'name' | 'mono' | 'grad' | 'verified'> & { online?: boolean }
interface ChatWith { matchId: string; user: ChatPartner }

export function useJodiApp() {
  const { user: me, setUser, logout: authLogout, deleteAccount } = useAuth()

  const [tab, setTab] = useState<Tab>('discover')
  const [prevTab, setPrevTab] = useState<Tab>('matches')

  // --- deck ---
  const [deck, setDeck] = useState<DeckCandidate[]>([])
  const [deckLoading, setDeckLoading] = useState(true)
  const [deckIndex, setDeckIndex] = useState(0)
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0, active: false })
  const [fling, setFling] = useState<FlingState | null>(null)
  const [matchProfile, setMatchProfile] = useState<PublicUser | null>(null)
  const [detail, setDetail] = useState<DeckCandidate | null>(null)

  const dragStart = useRef({ x: 0, y: 0 })
  const moved = useRef(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>()
  const matchTimer = useRef<ReturnType<typeof setTimeout>>()

  const loadDeck = async () => {
    setDeckLoading(true)
    try {
      const { deck } = await api.get<{ deck: DeckCandidate[] }>('/api/deck')
      setDeck(deck)
      setDeckIndex(0)
    } finally {
      setDeckLoading(false)
    }
  }

  useEffect(() => { void loadDeck() }, [])

  // --- likes ("crushes") ---
  const [likes, setLikes] = useState<LikeEntry[]>([])
  const [likesLoading, setLikesLoading] = useState(false)
  const loadLikes = async () => {
    setLikesLoading(true)
    try {
      const { likes } = await api.get<{ likes: LikeEntry[] }>('/api/likes')
      setLikes(likes)
    } finally {
      setLikesLoading(false)
    }
  }

  // --- matches / chats ---
  const [newMatches, setNewMatches] = useState<MatchSummary[]>([])
  const [chats, setChats] = useState<MatchSummary[]>([])
  const [matchesLoading, setMatchesLoading] = useState(false)
  const loadMatches = async () => {
    setMatchesLoading(true)
    try {
      const { newMatches, chats } = await api.get<{ newMatches: MatchSummary[]; chats: MatchSummary[] }>('/api/matches')
      setNewMatches(newMatches)
      setChats(chats)
    } finally {
      setMatchesLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'likes') void loadLikes()
    if (tab === 'matches') void loadMatches()
  }, [tab])

  // --- chat thread ---
  const [chatWith, setChatWith] = useState<ChatWith | null>(null)
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [theirTyping, setTheirTyping] = useState(false)
  const typingStopTimer = useRef<ReturnType<typeof setTimeout>>()
  const myTypingStopTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onMessage = (payload: { matchId: string; id: string; text: string; senderId: string; createdAt: string }) => {
      setChatWith(current => {
        if (!current || current.matchId !== payload.matchId) return current
        setChatMsgs(prev => (prev.some(m => m.id === payload.id) ? prev : [...prev, { id: payload.id, text: payload.text, mine: payload.senderId === me?.id, createdAt: payload.createdAt }]))
        return current
      })
      setChats(prev => prev.map(c => c.matchId === payload.matchId
        ? { ...c, hasMessages: true, lastMessage: { text: payload.text, mine: payload.senderId === me?.id, createdAt: payload.createdAt } }
        : c))
    }
    const onTyping = (payload: { matchId: string; isTyping: boolean }) => {
      setChatWith(current => {
        if (!current || current.matchId !== payload.matchId) return current
        setTheirTyping(payload.isTyping)
        clearTimeout(typingStopTimer.current)
        if (payload.isTyping) typingStopTimer.current = setTimeout(() => setTheirTyping(false), 3000)
        return current
      })
    }
    // Fires when someone ELSE's swipe completes a mutual match with us — the
    // swiper already gets their match modal from the swipe response; this is
    // what tells the person who liked first that it just became a match.
    const onMatch = (payload: { matchId: string; user: PublicUser }) => {
      setMatchProfile(payload.user)
    }
    socket.on('message', onMessage)
    socket.on('typing', onTyping)
    socket.on('match', onMatch)
    return () => { socket.off('message', onMessage); socket.off('typing', onTyping); socket.off('match', onMatch) }
  }, [me?.id])

  const openChat = async (matchId: string, user: ChatPartner) => {
    setPrevTab(tab === 'chat' ? prevTab : tab)
    setChatWith({ matchId, user })
    setTab('chat')
    setChatMsgs([])
    setTheirTyping(false)
    getSocket()?.emit('join_match', matchId)
    const { messages } = await api.get<{ messages: ChatMessage[] }>(`/api/matches/${matchId}/messages`)
    setChatMsgs(messages)
    setChats(prev => prev.map(c => (c.matchId === matchId ? { ...c, unreadCount: 0 } : c)))
  }

  const backToMatches = () => setTab(prevTab || 'matches')

  const onDraft = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value)
    if (!chatWith) return
    getSocket()?.emit('typing', { matchId: chatWith.matchId, isTyping: true })
    clearTimeout(myTypingStopTimer.current)
    myTypingStopTimer.current = setTimeout(() => getSocket()?.emit('typing', { matchId: chatWith.matchId, isTyping: false }), 1500)
  }
  const onDraftKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') void sendMsg() }
  const sendMsg = async () => {
    const text = draft.trim()
    if (!text || !chatWith) return
    setDraft('')
    clearTimeout(myTypingStopTimer.current)
    getSocket()?.emit('typing', { matchId: chatWith.matchId, isTyping: false })
    const { message } = await api.post<{ message: ChatMessage }>(`/api/matches/${chatWith.matchId}/messages`, { text })
    setChatMsgs(prev => (prev.some(m => m.id === message.id) ? prev : [...prev, message]))
    setChats(prev => prev.map(c => (c.matchId === chatWith.matchId ? { ...c, hasMessages: true, lastMessage: { text: message.text, mine: true, createdAt: message.createdAt } } : c)))
  }

  const openChatProfile = () => {
    if (!chatWith) return
    const fromDeck = deck.find(u => u.id === chatWith.user.id)
    const fromMatches = [...newMatches, ...chats].find(m => m.user.id === chatWith.user.id)?.user
    const base = fromDeck ?? fromMatches
    const stub: DeckCandidate = fromDeck ?? {
      id: chatWith.user.id, name: chatWith.user.name, mono: chatWith.user.mono, grad: chatWith.user.grad,
      age: base && 'age' in base ? base.age : 0, city: base?.city ?? '', verified: chatWith.user.verified,
      chips: base?.chips ?? [], photos: base?.photos ?? [], prompts: base?.prompts ?? [],
      voiceUrl: base?.voiceUrl ?? null, voiceDurationSec: base?.voiceDurationSec ?? null,
      score: 0, compat: [],
    }
    setDetail(stub)
  }

  // --- deck drag / fling ---
  const onCardDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
    dragStart.current = { x: e.clientX, y: e.clientY }
    moved.current = false
    setDrag({ x: 0, y: 0, active: true })
  }
  const onCardMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDrag(prev => {
      if (!prev.active) return prev
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true
      return { x: dx, y: dy, active: true }
    })
  }
  const onCardUp = () => {
    const dx = drag.x
    if (dx > 95) { void doLike(); return }
    if (dx < -95) { void doPass(); return }
    setDrag({ x: 0, y: 0, active: false })
    if (!moved.current) openDetail()
  }

  const swipe = async (target: DeckCandidate, action: 'LIKE' | 'PASS' | 'ROSE') => {
    try {
      const res = await api.post<{ matched: boolean; matchedUser?: PublicUser }>('/api/deck/swipe', { toUserId: target.id, action })
      if (res.matched && res.matchedUser) {
        clearTimeout(matchTimer.current)
        matchTimer.current = setTimeout(() => setMatchProfile(res.matchedUser!), 60)
      }
    } catch {
      // best-effort — the card has already advanced locally
    }
  }

  const advance = (dir: FlingDir, action: 'LIKE' | 'PASS' | 'ROSE') => {
    const target = deck[deckIndex]
    setFling({ dir })
    setDrag({ x: 0, y: 0, active: false })
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      setFling(null)
      setDeckIndex(i => i + 1)
      setDrag({ x: 0, y: 0, active: false })
      if (target) void swipe(target, action)
    }, 340)
  }
  const doLike = async () => advance('like', 'LIKE')
  const doPass = async () => advance('pass', 'PASS')
  const sendRose = async () => advance('rose', 'ROSE')
  const resetDeck = async () => { await api.post('/api/deck/reset'); await loadDeck() }
  const undoCard = () => {
    const prevIdx = Math.max(0, deckIndex - 1)
    const target = deck[prevIdx]
    setDeckIndex(prevIdx)
    setFling(null)
    setDrag({ x: 0, y: 0, active: false })
    if (target) void api.del(`/api/deck/swipe/${target.id}`).catch(() => {})
  }

  const openDetail = () => setDetail(deck[deckIndex] ?? null)
  const closeDetail = () => setDetail(null)
  const detailLike = () => { setDetail(null); setTimeout(() => void doLike(), 60) }
  const detailPass = () => { setDetail(null); setTimeout(() => void doPass(), 60) }
  const detailRose = () => { setDetail(null); setTimeout(() => void sendRose(), 60) }

  const reportProfile = async (targetId: string, reason: string) => {
    await api.post('/api/report', { targetId, reason })
  }
  const blockProfile = async (targetId: string) => {
    await api.post('/api/block', { targetId })
    setDeck(prev => prev.filter(p => p.id !== targetId))
    setLikes(prev => prev.filter(l => l.user.id !== targetId))
  }

  const closeMatch = () => setMatchProfile(null)
  const messageMatch = async () => {
    if (!matchProfile) return
    const mp = matchProfile
    setMatchProfile(null)
    // The other side may have already sent a message before we got here, in
    // which case this match has already moved from newMatches into chats —
    // so it has to be searched for in both.
    const { newMatches: freshNew, chats: freshChats } = await api.get<{ newMatches: MatchSummary[]; chats: MatchSummary[] }>('/api/matches')
    setNewMatches(freshNew)
    setChats(freshChats)
    const found = [...freshNew, ...freshChats].find(m => m.user.id === mp.id) ?? null
    if (found) void openChat(found.matchId, { ...found.user, online: found.online })
  }

  const likeBack = async (targetId: string) => {
    const res = await api.post<{ matched: boolean; matchedUser?: PublicUser }>('/api/deck/swipe', { toUserId: targetId, action: 'LIKE' })
    setLikes(prev => prev.filter(l => l.user.id !== targetId))
    if (res.matched && res.matchedUser) setMatchProfile(res.matchedUser)
  }

  // --- profile editing ---
  const updateProfileField = async (field: string, value: string) => {
    const { user } = await api.put<{ user: MeUser }>('/api/profile', { [field]: value })
    setUser(user)
  }
  const updatePrompts = async (prompts: { question: string; answer: string }[]) => {
    const { user } = await api.put<{ user: MeUser }>('/api/profile/prompts', { prompts })
    setUser(user)
  }
  const uploadPhoto = async (file: File) => {
    const form = new FormData()
    form.append('photo', file)
    const { user } = await api.upload<{ user: MeUser }>('/api/profile/photo', form)
    setUser(user)
  }
  const deletePhoto = async (photoId: string) => {
    const { user } = await api.del<{ user: MeUser }>(`/api/profile/photo/${photoId}`)
    setUser(user)
  }
  const uploadVoice = async (blob: Blob, durationSec: number) => {
    const form = new FormData()
    form.append('voice', blob, 'voice-intro.webm')
    form.append('durationSec', String(durationSec))
    const { user } = await api.upload<{ user: MeUser }>('/api/profile/voice', form)
    setUser(user)
  }
  const deleteVoice = async () => {
    const { user } = await api.del<{ user: MeUser }>('/api/profile/voice')
    setUser(user)
  }

  // --- nav ---
  const goDiscover = () => setTab('discover')
  const goLikes = () => setTab('likes')
  const goMatches = () => setTab('matches')
  const goYou = () => setTab('you')

  // --- derived ---
  const total = deck.length
  const hasDeck = deckIndex < total
  const profile = deck[deckIndex]
  const nextProfile = deck[deckIndex + 1]

  let tx: number, ty: number, rot: number, trans: string
  if (fling) {
    tx = fling.dir === 'pass' ? -600 : fling.dir === 'rose' ? 0 : 600
    ty = fling.dir === 'rose' ? -700 : -40
    rot = fling.dir === 'pass' ? -22 : fling.dir === 'rose' ? 0 : 22
    trans = 'transform .34s ease'
  } else {
    tx = drag.x; ty = drag.y; rot = drag.x / 18
    trans = drag.active ? 'none' : 'transform .3s cubic-bezier(.2,.8,.2,1)'
  }
  const topCardWrapStyle: CSSProperties = {
    position: 'absolute', inset: 0, touchAction: 'none', cursor: 'grab',
    transform: `translate(${tx}px,${ty}px) rotate(${rot}deg)`,
    transition: trans,
  }

  const dotCols = ['#E5326E', '#F5A524', '#16A6A0', '#7B3FA0', '#3B4CC0']
  const progressDots = deck.map((_, i) => ({
    color: i < deckIndex ? dotCols[i % dotCols.length] : i === deckIndex ? '#F5A524' : '#EFE3CC',
    core: i <= deckIndex ? 'rgba(32,24,18,.55)' : 'rgba(32,24,18,.2)',
  }))

  const likesYou = likes.map((l, i) => ({ ...l, blur: i === 0 ? 'blur(0px)' : 'blur(13px)' }))

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    const diffMs = Date.now() - d.getTime()
    const mins = diffMs / 60000
    if (mins < 1) return 'now'
    if (mins < 60) return `${Math.round(mins)}m`
    if (mins < 60 * 24) return `${Math.round(mins / 60)}h`
    return `${Math.round(mins / (60 * 24))}d`
  }
  const chatsView = chats.map(c => ({
    matchId: c.matchId, user: c.user, online: c.online,
    time: c.lastMessage ? fmtTime(c.lastMessage.createdAt) : '',
    unread: c.unreadCount > 0,
    snippet: c.lastMessage ? (c.lastMessage.mine ? `you: ${c.lastMessage.text}` : c.lastMessage.text) : '',
    snipColor: c.unreadCount > 0 ? '#201812' : '#A69A85',
    snipWeight: c.unreadCount > 0 ? 600 : 400,
  }))
  const unreadCount = chats.reduce((n, c) => n + c.unreadCount, 0)

  const det = detail
  const detailIsDeckCard = !!(det && profile && det.id === profile.id)
  const detailPrompts = (det?.prompts ?? []).map(p => ({ q: p.question, a: p.answer, like: detailLike }))
  const detailCompat: (CompatRow & { width: string; color: string })[] = (det?.compat ?? []).map(c => ({
    ...c, width: `${c.score}%`, color: c.score < 65 ? '#F5A524' : '#E5326E',
  }))

  const navC = (t: Tab) => (tab === t ? '#E5326E' : '#A69A85')
  const navF = (t: Tab) => (tab === t ? '#E5326E' : 'none')
  const navW = (t: Tab) => (tab === t ? 800 : 600)
  const navB = (t: Tab) => (tab === t ? 'rgba(229,50,110,.12)' : 'transparent')

  return {
    me: me as MeUser,
    isDiscover: tab === 'discover', isLikes: tab === 'likes', isMatches: tab === 'matches',
    isChat: tab === 'chat', isYou: tab === 'you', showNav: tab !== 'chat',

    profile, nextProfile, hasDeck, deckEnded: !deckLoading && !hasDeck, deckLoading,
    topCardWrapStyle,
    likeOpacity: fling ? (fling.dir !== 'pass' ? 1 : 0) : clamp(drag.x / 80),
    passOpacity: fling ? (fling.dir === 'pass' ? 1 : 0) : clamp(-drag.x / 80),
    onCardDown, onCardMove, onCardUp,
    flingLike: () => void doLike(), flingPass: () => void doPass(), sendRose: () => void sendRose(), resetDeck: () => void resetDeck(),
    undoCard, undoOpacity: deckIndex > 0 ? 1 : 0.35,
    progressDots, remainingLabel: hasDeck ? `${total - deckIndex} left` : 'all seen',

    likesYou, likesCount: likes.length, likesLoading, likeBack: (id: string) => void likeBack(id),

    newMatches, chats: chatsView, openChat: (matchId: string, user: ChatPartner) => void openChat(matchId, user), matchesLoading,

    chatWith, chatMsgs, showTyping: theirTyping,
    draft, onDraft, onDraftKey, sendMsg: () => void sendMsg(),
    sendBg: draft.trim() ? '#E5326E' : '#cdbfa6',
    backToMatches, openChatProfile,

    goDiscover, goLikes, goMatches, goYou,
    navDiscover: navC('discover'), navDiscoverFill: navF('discover'), navDiscoverW: navW('discover'), navDiscoverBg: navB('discover'),
    navLikes: navC('likes'), navLikesFill: navF('likes'), navLikesW: navW('likes'), navLikesBg: navB('likes'),
    navMatches: navC('matches'), navMatchesFill: navF('matches'), navMatchesW: navW('matches'), navMatchesBg: navB('matches'),
    navYou: navC('you'), navYouFill: navF('you'), navYouW: navW('you'), navYouBg: navB('you'),
    hasUnread: unreadCount > 0, unreadCount,

    showMatch: !!matchProfile, matchProfile, closeMatch, messageMatch: () => void messageMatch(),

    showDetail: !!detail, detail: det, detailIsDeckCard, detailPrompts, detailCompat,
    closeDetail, detailLike, detailPass, detailRose,
    reportProfile: (targetId: string, reason: string) => reportProfile(targetId, reason),
    blockProfile: (targetId: string) => blockProfile(targetId),

    updateProfileField, updatePrompts, uploadPhoto, deletePhoto, uploadVoice, deleteVoice,
    logout: authLogout, deleteAccount,
  }
}

export type JodiApp = ReturnType<typeof useJodiApp>
