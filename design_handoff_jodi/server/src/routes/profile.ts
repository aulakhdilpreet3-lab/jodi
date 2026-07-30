import fs from 'node:fs/promises'
import path from 'node:path'
import { Router } from 'express'
import { type AuthedRequest, requireAuth } from '../auth.js'
import { prisma } from '../db.js'
import { meUser } from '../lib/dto.js'
import { UPLOAD_ROOT, uploadPhoto, uploadVoice } from '../upload.js'

export const profileRouter = Router()
profileRouter.use(requireAuth)

const ALLOWED_FIELDS = ['name', 'city', 'chips', 'familyCloseness', 'faith', 'languages', 'kids'] as const

profileRouter.put('/', async (req: AuthedRequest, res) => {
  const data: Record<string, string> = {}
  for (const field of ALLOWED_FIELDS) {
    const v = req.body?.[field]
    if (typeof v === 'string') data[field] = v.slice(0, field === 'chips' || field === 'languages' ? 300 : 120)
  }
  if (data.name !== undefined && !data.name.trim()) return res.status(400).json({ error: 'name cannot be empty' })

  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
    include: { prompts: true, photos: true },
  })
  res.json({ user: meUser(user) })
})

profileRouter.put('/prompts', async (req: AuthedRequest, res) => {
  const prompts = req.body?.prompts
  if (!Array.isArray(prompts) || prompts.length > 3) {
    return res.status(400).json({ error: 'prompts must be an array of at most 3 { question, answer }' })
  }
  for (const p of prompts) {
    if (typeof p.question !== 'string' || typeof p.answer !== 'string' || !p.question.trim() || !p.answer.trim()) {
      return res.status(400).json({ error: 'each prompt needs a question and an answer' })
    }
  }

  await prisma.$transaction([
    prisma.prompt.deleteMany({ where: { userId: req.userId } }),
    prisma.prompt.createMany({
      data: prompts.map((p: { question: string; answer: string }, i: number) => ({
        userId: req.userId!,
        question: p.question.trim().slice(0, 80),
        answer: p.answer.trim().slice(0, 240),
        order: i,
      })),
    }),
  ])

  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId }, include: { prompts: true, photos: true } })
  res.json({ user: meUser(user) })
})

profileRouter.post('/photo', uploadPhoto.single('photo'), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'no photo uploaded' })
  const count = await prisma.photo.count({ where: { userId: req.userId } })
  await prisma.photo.create({
    data: { userId: req.userId!, url: `/uploads/photos/${req.file.filename}`, order: count },
  })
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId }, include: { prompts: true, photos: true } })
  res.status(201).json({ user: meUser(user) })
})

profileRouter.delete('/photo/:id', async (req: AuthedRequest, res) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } })
  if (!photo || photo.userId !== req.userId) return res.status(404).json({ error: 'not found' })
  await prisma.photo.delete({ where: { id: photo.id } })
  await fs.rm(path.join(UPLOAD_ROOT, 'photos', path.basename(photo.url)), { force: true })
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId }, include: { prompts: true, photos: true } })
  res.json({ user: meUser(user) })
})

profileRouter.post('/voice', uploadVoice.single('voice'), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'no audio uploaded' })
  const duration = Number(req.body?.durationSec)
  const existing = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } })
  if (existing.voiceUrl) {
    await fs.rm(path.join(UPLOAD_ROOT, 'voice', path.basename(existing.voiceUrl)), { force: true })
  }
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { voiceUrl: `/uploads/voice/${req.file.filename}`, voiceDurationSec: Number.isFinite(duration) ? duration : null },
    include: { prompts: true, photos: true },
  })
  res.status(201).json({ user: meUser(user) })
})

profileRouter.delete('/voice', async (req: AuthedRequest, res) => {
  const existing = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } })
  if (existing.voiceUrl) {
    await fs.rm(path.join(UPLOAD_ROOT, 'voice', path.basename(existing.voiceUrl)), { force: true })
  }
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { voiceUrl: null, voiceDurationSec: null },
    include: { prompts: true, photos: true },
  })
  res.json({ user: meUser(user) })
})
