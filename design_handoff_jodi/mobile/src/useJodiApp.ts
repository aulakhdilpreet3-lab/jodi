import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { useAuth } from './AuthContext'
import { getSocket } from './socket'
import type {
  ChatMessage, CompatRow, DeckCandidate, LikeEntry, MatchSummary, MeUser, PublicUser, Tab,
} from './types'

type SwipeAction = 'LIKE' | 'PASS' | 'ROSE'
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
  const [matchProfile, setMatchProfile] = useState<PublicUser | null>(null)
  const [detail, setDetail] = useState<DeckCandidate | null>(null)
  const matchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

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
  const typingStopTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const myTypingStopTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

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

  const onDraft = (text: string) => {
    setDraft(text)
    if (!chatWith) return
    getSocket()?.emit('typing', { matchId: chatWith.matchId, isTyping: true })
    clearTimeout(myTypingStopTimer.current)
    myTypingStopTimer.current = setTimeout(() => getSocket()?.emit('typing', { matchId: chatWith.matchId, isTyping: false }), 1500)
  }
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

  // --- swipe commits (visual fling animation lives in DiscoverScreen; this
  // just advances state and fires the API call once that animation ends) ---
  const swipe = async (target: DeckCandidate, action: SwipeAction) => {
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
  const commit = (action: SwipeAction) => {
    const target = deck[deckIndex]
    setDeckIndex(i => i + 1)
    if (target) void swipe(target, action)
  }
  const likeCurrent = () => commit('LIKE')
  const passCurrent = () => commit('PASS')
  const roseCurrent = () => commit('ROSE')

  const resetDeck = async () => { await api.post('/api/deck/reset'); await loadDeck() }
  const undoCard = () => {
    const prevIdx = Math.max(0, deckIndex - 1)
    const target = deck[prevIdx]
    setDeckIndex(prevIdx)
    if (target) void api.del(`/api/deck/swipe/${target.id}`).catch(() => {})
  }

  const openDetail = () => setDetail(deck[deckIndex] ?? null)
  const closeDetail = () => setDetail(null)
  const detailLike = () => { setDetail(null); setTimeout(likeCurrent, 60) }
  const detailPass = () => { setDetail(null); setTimeout(passCurrent, 60) }
  const detailRose = () => { setDetail(null); setTimeout(roseCurrent, 60) }

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
  const uploadPhoto = async (uri: string) => {
    const form = new FormData()
    const filename = uri.split('/').pop() || 'photo.jpg'
    const ext = filename.split('.').pop()?.toLowerCase()
    const type = ext === 'png' ? 'image/png' : 'image/jpeg'
    // React Native's fetch/FormData understands this {uri,name,type} shape
    // for multipart uploads in place of a browser File/Blob.
    form.append('photo', { uri, name: filename, type } as unknown as Blob)
    const { user } = await api.upload<{ user: MeUser }>('/api/profile/photo', form)
    setUser(user)
  }
  const deletePhoto = async (photoId: string) => {
    const { user } = await api.del<{ user: MeUser }>(`/api/profile/photo/${photoId}`)
    setUser(user)
  }
  const uploadVoice = async (uri: string, durationSec: number) => {
    const form = new FormData()
    form.append('voice', { uri, name: 'voice-intro.m4a', type: 'audio/m4a' } as unknown as Blob)
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

  const dotCols = ['#E5326E', '#F5A524', '#16A6A0', '#7B3FA0', '#3B4CC0']
  const progressDots = deck.map((_, i) => ({
    color: i < deckIndex ? dotCols[i % dotCols.length] : i === deckIndex ? '#F5A524' : '#EFE3CC',
    core: i <= deckIndex ? 'rgba(32,24,18,.55)' : 'rgba(32,24,18,.2)',
  }))

  const likesYou = likes.map((l, i) => ({ ...l, blurred: i !== 0 }))

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
    snipWeight: c.unreadCount > 0 ? ('600' as const) : ('400' as const),
  }))
  const unreadCount = chats.reduce((n, c) => n + c.unreadCount, 0)

  const det = detail
  const detailIsDeckCard = !!(det && profile && det.id === profile.id)
  const detailPrompts = (det?.prompts ?? []).map(p => ({ q: p.question, a: p.answer }))
  const detailCompat: (CompatRow & { width: string; color: string })[] = (det?.compat ?? []).map(c => ({
    ...c, width: `${c.score}%`, color: c.score < 65 ? '#F5A524' : '#E5326E',
  }))

  const navActive = (t: Tab) => tab === t

  return {
    me: me as MeUser,
    isDiscover: tab === 'discover', isLikes: tab === 'likes', isMatches: tab === 'matches',
    isChat: tab === 'chat', isYou: tab === 'you', showNav: tab !== 'chat',

    deck, profile, nextProfile, deckIndex, hasDeck, deckEnded: !deckLoading && !hasDeck, deckLoading,
    likeCurrent, passCurrent, roseCurrent,
    undoCard, undoOpacity: deckIndex > 0 ? 1 : 0.35,
    progressDots, remainingLabel: hasDeck ? `${total - deckIndex} left` : 'all seen',
    resetDeck, openDetail,

    likesYou, likesCount: likes.length, likesLoading, likeBack,

    newMatches, chats: chatsView, openChat, matchesLoading,

    chatWith, chatMsgs, showTyping: theirTyping,
    draft, onDraft, sendMsg,
    backToMatches, openChatProfile,

    goDiscover, goLikes, goMatches, goYou,
    navDiscover: navActive('discover'), navLikes: navActive('likes'), navMatches: navActive('matches'), navYou: navActive('you'),
    hasUnread: unreadCount > 0, unreadCount,

    showMatch: !!matchProfile, matchProfile, closeMatch, messageMatch: () => void messageMatch(),

    showDetail: !!detail, detail: det, detailIsDeckCard, detailPrompts, detailCompat,
    closeDetail, detailLike, detailPass, detailRose,
    reportProfile, blockProfile,

    updateProfileField, updatePrompts, uploadPhoto, deletePhoto, uploadVoice, deleteVoice,
    logout: authLogout, deleteAccount,
  }
}

export type JodiApp = ReturnType<typeof useJodiApp>
