import { Router } from 'express'
import { type AuthedRequest, requireAuth } from '../auth.js'
import { prisma } from '../db.js'

export const safetyRouter = Router()
safetyRouter.use(requireAuth)

safetyRouter.post('/report', async (req: AuthedRequest, res) => {
  const { targetId, reason } = req.body ?? {}
  if (typeof targetId !== 'string' || typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ error: 'targetId and reason are required' })
  }
  if (targetId === req.userId) return res.status(400).json({ error: "you can't report yourself" })

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) return res.status(404).json({ error: 'profile not found' })

  await prisma.report.create({ data: { reporterId: req.userId!, targetId, reason: reason.trim().slice(0, 500) } })
  res.status(201).json({ ok: true })
})

safetyRouter.post('/block', async (req: AuthedRequest, res) => {
  const { targetId } = req.body ?? {}
  if (typeof targetId !== 'string') return res.status(400).json({ error: 'targetId is required' })
  if (targetId === req.userId) return res.status(400).json({ error: "you can't block yourself" })

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: req.userId!, blockedId: targetId } },
    update: {},
    create: { blockerId: req.userId!, blockedId: targetId },
  })
  res.status(201).json({ ok: true })
})

safetyRouter.get('/blocks', async (req: AuthedRequest, res) => {
  const blocks = await prisma.block.findMany({ where: { blockerId: req.userId }, include: { blocked: true } })
  res.json({ blocked: blocks.map(b => ({ id: b.blocked.id, name: b.blocked.name })) })
})

safetyRouter.delete('/block/:targetId', async (req: AuthedRequest, res) => {
  await prisma.block.deleteMany({ where: { blockerId: req.userId, blockedId: req.params.targetId } })
  res.json({ ok: true })
})
