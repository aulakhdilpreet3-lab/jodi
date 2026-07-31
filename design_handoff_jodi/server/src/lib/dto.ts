import type { Photo, Prompt, User } from '@prisma/client'
import { ageFromBirthdate } from '../auth.js'
import { gradientForId, initialFor } from './gradients.js'

type UserWithExtras = User & { prompts?: Prompt[]; photos?: Photo[] }

export function publicUser(u: UserWithExtras) {
  return {
    id: u.id,
    name: u.name,
    age: ageFromBirthdate(u.birthdate),
    city: u.city,
    verified: u.verified,
    mono: initialFor(u.name),
    grad: gradientForId(u.id),
    chips: u.chips ? u.chips.split(',').map(c => c.trim()).filter(Boolean) : [],
    photos: (u.photos ?? []).sort((a, b) => a.order - b.order).map(p => ({ id: p.id, url: p.url })),
    prompts: (u.prompts ?? []).sort((a, b) => a.order - b.order).map(p => ({ id: p.id, question: p.question, answer: p.answer })),
    voiceUrl: u.voiceUrl ?? null,
    voiceDurationSec: u.voiceDurationSec ?? null,
  }
}

function computeProfileStrength(u: UserWithExtras): number {
  const checks = [
    !!u.city,
    !!u.chips,
    (u.prompts?.length ?? 0) >= 3,
    !!u.familyCloseness,
    !!u.faith,
    !!u.languages,
    !!u.kids,
    (u.photos?.length ?? 0) > 0,
    !!u.voiceUrl,
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}

export function meUser(u: UserWithExtras) {
  return {
    ...publicUser(u),
    email: u.email,
    familyCloseness: u.familyCloseness,
    faith: u.faith,
    languages: u.languages,
    kids: u.kids,
    profileStrength: computeProfileStrength(u),
  }
}

export type PublicUser = ReturnType<typeof publicUser>
