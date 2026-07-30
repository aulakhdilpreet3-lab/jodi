import { Router } from 'express'
import { type AuthedRequest, requireAuth } from '../auth.js'
import { prisma } from '../db.js'
import { publicUser } from '../lib/dto.js'

export const likesRouter = Router()
likesRouter.use(requireAuth)

likesRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = req.userId!

  const [decidedByMe, blockedByMe, blockedMe, likesOnMe] = await Promise.all([
    prisma.swipe.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
    prisma.swipe.findMany({
      where: { toUserId: userId, action: { in: ['LIKE', 'ROSE'] } },
      include: { from: { include: { prompts: true, photos: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const exclude = new Set<string>([
    ...decidedByMe.map(s => s.toUserId),
    ...blockedByMe.map(b => b.blockedId),
    ...blockedMe.map(b => b.blockerId),
  ])

  const seen = new Set<string>()
  const likes = likesOnMe.filter(s => {
    if (exclude.has(s.fromUserId) || seen.has(s.fromUserId)) return false
    seen.add(s.fromUserId)
    return true
  })

  res.json({
    likes: likes.map(s => ({ user: publicUser(s.from), rose: s.action === 'ROSE' })),
  })
})
