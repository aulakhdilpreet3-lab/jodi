export interface CompatInput {
  chips: string
  familyCloseness: string
  faith: string
  languages: string
  kids: string
}

const splitList = (s: string) =>
  s.split(',').map(v => v.trim().toLowerCase()).filter(Boolean)

function jaccard(a: string, b: string): number {
  const setA = new Set(splitList(a))
  const setB = new Set(splitList(b))
  if (setA.size === 0 && setB.size === 0) return 0.5
  const intersection = [...setA].filter(x => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0.5 : intersection / union
}

function exactish(a: string, b: string): number {
  const av = a.trim().toLowerCase()
  const bv = b.trim().toLowerCase()
  if (!av && !bv) return 0.5
  if (!av || !bv) return 0.35
  if (av === bv) return 1
  return splitList(a).some(w => splitList(b).includes(w)) ? 0.6 : 0.25
}

export interface CompatRow {
  key: 'languages' | 'faith' | 'kids' | 'interests'
  label: string
  value: string
  score: number
}

export interface CompatResult {
  score: number
  rows: CompatRow[]
}

function describe(a: string, b: string, label: string): string {
  const av = a.trim(), bv = b.trim()
  if (!av && !bv) return 'not set yet'
  if (av && bv && av.toLowerCase() === bv.toLowerCase()) return `both ${av.toLowerCase()}`
  if (av && bv) return `${av} & ${bv}`
  return `only one of you set ${label}`
}

function describeOverlap(a: string, b: string): string {
  const setA = new Set(splitList(a))
  const setB = splitList(b)
  const shared = setB.filter(x => setA.has(x))
  if (shared.length === 0) return 'no shared tags yet'
  return shared.join(', ')
}

export function computeCompatibility(a: CompatInput, b: CompatInput): CompatResult {
  const languages = jaccard(a.languages, b.languages)
  const interests = jaccard(a.chips, b.chips)
  const faith = exactish(a.faith, b.faith)
  const kids = exactish(a.kids, b.kids)
  const family = exactish(a.familyCloseness, b.familyCloseness)

  const weighted = languages * 0.3 + interests * 0.25 + faith * 0.2 + kids * 0.15 + family * 0.1
  const score = Math.round(Math.max(0, Math.min(1, weighted)) * 100)

  const rows: CompatRow[] = [
    { key: 'languages', label: 'languages', value: describe(a.languages, b.languages, 'languages'), score: Math.round(languages * 100) },
    { key: 'faith', label: 'faith', value: describe(a.faith, b.faith, 'faith'), score: Math.round(faith * 100) },
    { key: 'kids', label: 'what you want', value: describe(a.kids, b.kids, 'what you want'), score: Math.round(kids * 100) },
    { key: 'interests', label: 'shared interests', value: describeOverlap(a.chips, b.chips), score: Math.round(interests * 100) },
  ]

  return { score, rows }
}
