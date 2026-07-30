export interface Prompt {
  id?: string
  question: string
  answer: string
}

export interface PublicUser {
  id: string
  name: string
  age: number
  city: string
  verified: boolean
  mono: string
  grad: string
  chips: string[]
  photos: { id: string; url: string }[]
  prompts: Prompt[]
  voiceUrl: string | null
  voiceDurationSec: number | null
}

export interface MeUser extends PublicUser {
  email: string
  familyCloseness: string
  faith: string
  languages: string
  kids: string
  profileStrength: number
}

export interface CompatRow {
  key: 'languages' | 'faith' | 'kids' | 'interests'
  label: string
  value: string
  score: number
}

export interface DeckCandidate extends PublicUser {
  score: number
  compat: CompatRow[]
}

export interface LikeEntry {
  user: PublicUser
  rose: boolean
}

export interface MatchSummary {
  matchId: string
  user: PublicUser
  online: boolean
  createdAt: string
  lastMessage: { text: string; mine: boolean; createdAt: string } | null
  unreadCount: number
  hasMessages: boolean
}

export interface ChatMessage {
  id: string
  text: string
  mine: boolean
  createdAt: string
}

export type Tab = 'discover' | 'likes' | 'matches' | 'chat' | 'you'

export interface DragState {
  x: number
  y: number
  active: boolean
}

export type FlingDir = 'like' | 'pass' | 'rose'

export interface FlingState {
  dir: FlingDir
}

export const PREF_FIELDS = ['familyCloseness', 'faith', 'languages', 'kids'] as const
export type PrefField = (typeof PREF_FIELDS)[number]
