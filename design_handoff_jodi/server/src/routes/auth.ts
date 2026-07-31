import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { type AuthedRequest, ageFromBirthdate, minAge, requireAuth, signToken } from '../auth.js'
import { prisma } from '../db.js'
import { meUser } from '../lib/dto.js'
import { UPLOAD_ROOT } from '../upload.js'

export const authRouter = Router()

authRouter.post('/signup', async (req, res) => {
  const { email, password, name, birthdate } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || typeof birthdate !== 'string') {
    return res.status(400).json({ error: 'email, password, name, and birthdate are required' })
  }
  if (!email.includes('@')) return res.status(400).json({ error: 'enter a valid email' })
  if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' })
  if (!name.trim()) return res.status(400).json({ error: 'name is required' })

  const dob = new Date(birthdate)
  if (Number.isNaN(dob.getTime())) return res.status(400).json({ error: 'invalid birthdate' })
  if (!minAge(dob, 18)) return res.status(403).json({ error: 'you must be 18 or older to use jodi' })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return res.status(409).json({ error: 'an account with that email already exists' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, name: name.trim(), birthdate: dob },
    include: { prompts: true, photos: true },
  })

  res.status(201).json({ token: signToken(user.id), user: meUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' })
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { prompts: true, photos: true } })
  if (!user) return res.status(401).json({ error: 'incorrect email or password' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'incorrect email or password' })

  res.json({ token: signToken(user.id), user: meUser(user) })
})

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { prompts: true, photos: true } })
  if (!user) return res.status(404).json({ error: 'not found' })
  res.json({ user: meUser(user), age: ageFromBirthdate(user.birthdate) })
})

// Apple guideline 5.1.1(v) requires in-app account deletion for any app
// that offers account creation. Cascades to prompts/photos/swipes/matches/
// messages/reports/blocks via the schema's onDelete: Cascade relations.
authRouter.delete('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { photos: true } })
  if (!user) return res.status(404).json({ error: 'not found' })

  await Promise.all([
    ...user.photos.map(p => fs.rm(path.join(UPLOAD_ROOT, 'photos', path.basename(p.url)), { force: true })),
    user.voiceUrl ? fs.rm(path.join(UPLOAD_ROOT, 'voice', path.basename(user.voiceUrl)), { force: true }) : Promise.resolve(),
  ])

  await prisma.user.delete({ where: { id: user.id } })
  res.json({ ok: true })
})
