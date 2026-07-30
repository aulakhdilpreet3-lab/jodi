export interface Profile {
  name: string
  age: number
  city: string
  dist: string
  mono: string
  grad: string
  verified: boolean
  score: number
  chips: string[]
  promptQ: string
  promptA: string
  voice: string
  mutual: boolean
}

export interface ProfilePrompt {
  q: string
  a: string
}

export type CompatRow = [string, string, number]

export interface ProfileExtras {
  prompts: ProfilePrompt[]
  compat: CompatRow[]
}

export interface LikeEntry {
  mono: string
  grad: string
  hint: string
  city: string
  rose: boolean
}

export interface ChatContact {
  name: string
  mono: string
  grad: string
  online: boolean
}

export interface ChatMessage {
  me: boolean
  text: string
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
