import { Router } from 'express'
import { type AuthedRequest, requireAuth } from '../auth.js'
import { prisma } from '../db.js'
import { publicUser } from '../lib/dto.js'
import { isOnline } from '../lib/presence.js'

export const matchesRouter = Router()
matchesRouter.use(requireAuth)

export async function blockedEitherWay(userId: string, otherId: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherId },
        { blockerId: otherId, blockedId: userId },
      ],
    },
  })
  return !!block
}

matchesRouter.get('/', async (req: AuthedRequest, res) => {
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: req.userId }, { userBId: req.userId }] },
    include: {
      userA: { include: { prompts: true, photos: true } },
      userB: { include: { prompts: true, photos: true } },
    },
  })

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: req.userId }, { blockedId: req.userId }] },
  })
  const blockedIds = new Set(blocks.flatMap(b => [b.blockerId, b.blockedId]).filter(id => id !== req.userId))

  const enriched = await Promise.all(matches.filter(m => {
    const otherId = m.userAId === req.userId ? m.userBId : m.userAId
    return !blockedIds.has(otherId)
  }).map(async m => {
    const other = m.userAId === req.userId ? m.userB : m.userA
    const [lastMessage, unreadCount, messageCount] = await Promise.all([
      prisma.message.findFirst({ where: { matchId: m.id }, orderBy: { createdAt: 'desc' } }),
      prisma.message.count({ where: { matchId: m.id, senderId: other.id, readAt: null } }),
      prisma.message.count({ where: { matchId: m.id } }),
    ])
    return {
      matchId: m.id,
      user: publicUser(other),
      online: isOnline(other.id),
      createdAt: m.createdAt,
      lastMessage: lastMessage ? { text: lastMessage.text, mine: lastMessage.senderId === req.userId, createdAt: lastMessage.createdAt } : null,
      unreadCount,
      hasMessages: messageCount > 0,
    }
  }))

  const newMatches = enriched.filter(m => !m.hasMessages).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  const chats = enriched
    .filter(m => m.hasMessages)
    .sort((a, b) => +new Date(b.lastMessage!.createdAt) - +new Date(a.lastMessage!.createdAt))

  res.json({ newMatches, chats })
})
