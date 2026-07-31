const GRADIENTS = [
  'linear-gradient(150deg,#E5326E,#8E1247)',
  'linear-gradient(150deg,#F5A524,#C2571A)',
  'linear-gradient(150deg,#16A6A0,#0B5A56)',
  'linear-gradient(150deg,#7B3FA0,#3E1A63)',
  'linear-gradient(150deg,#3B4CC0,#1B2478)',
  'linear-gradient(150deg,#0E9B8E,#064F49)',
  'linear-gradient(150deg,#F26C8A,#A32B4F)',
]

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function gradientForId(id: string): string {
  return GRADIENTS[hashString(id) % GRADIENTS.length]
}

export function initialFor(name: string): string {
  return (name.trim()[0] || '?').toUpperCase()
}
