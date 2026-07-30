import { Router } from 'express'
import { type AuthedRequest, requireAuth } from '../auth.js'
import { prisma } from '../db.js'
import { getIO } from '../io.js'
import { blockedEitherWay } from './matches.js'

export const messagesRouter = Router({ mergeParams: true })
messagesRouter.use(requireAuth)

async function loadMatchForUser(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match || (match.userAId !== userId && match.userBId !== userId)) return null
  return match
}

messagesRouter.get('/:matchId/messages', async (req: AuthedRequest, res) => {
  const match = await loadMatchForUser(req.params.matchId, req.userId!)
  if (!match) return res.status(404).json({ error: 'match not found' })
  const otherIdForBlockCheck = match.userAId === req.userId ? match.userBId : match.userAId
  if (await blockedEitherWay(req.userId!, otherIdForBlockCheck)) return res.status(403).json({ error: 'blocked' })

  const messages = await prisma.message.findMany({ where: { matchId: match.id }, orderBy: { createdAt: 'asc' } })

  const otherId = match.userAId === req.userId ? match.userBId : match.userAId
  await prisma.message.updateMany({
    where: { matchId: match.id, senderId: otherId, readAt: null },
    data: { readAt: new Date() },
  })

  res.json({
    messages: messages.map(m => ({ id: m.id, text: m.text, mine: m.senderId === req.userId, createdAt: m.createdAt })),
  })
})

messagesRouter.post('/:matchId/messages', async (req: AuthedRequest, res) => {
  const match = await loadMatchForUser(req.params.matchId, req.userId!)
  if (!match) return res.status(404).json({ error: 'match not found' })
  const otherIdForBlockCheck = match.userAId === req.userId ? match.userBId : match.userAId
  if (await blockedEitherWay(req.userId!, otherIdForBlockCheck)) return res.status(403).json({ error: 'blocked' })

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) return res.status(400).json({ error: 'message text is required' })
  if (text.length > 2000) return res.status(400).json({ error: 'message is too long' })

  const message = await prisma.message.create({ data: { matchId: match.id, senderId: req.userId!, text: text.slice(0, 2000) } })

  const payload = { matchId: match.id, id: message.id, text: message.text, senderId: message.senderId, createdAt: message.createdAt }
  getIO().to(`match:${match.id}`).emit('message', payload)

  res.status(201).json({ message: { id: message.id, text: message.text, mine: true, createdAt: message.createdAt } })
})
