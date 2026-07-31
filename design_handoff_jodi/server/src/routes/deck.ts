import { Router } from 'express'
import { type AuthedRequest, requireAuth } from '../auth.js'
import { prisma } from '../db.js'
import { computeCompatibility } from '../lib/compatibility.js'
import { publicUser } from '../lib/dto.js'
import { seededShuffle, todaySeed } from '../lib/random.js'
import { getIO } from '../io.js'

export const deckRouter = Router()
deckRouter.use(requireAuth)

const DECK_SIZE = 5
const POOL_SIZE = 15

async function matchedPartnerIds(userId: string): Promise<Set<string>> {
  const matches = await prisma.match.findMany({ where: { OR: [{ userAId: userId }, { userBId: userId }] } })
  return new Set(matches.map(m => (m.userAId === userId ? m.userBId : m.userAId)))
}

async function excludedIds(userId: string): Promise<Set<string>> {
  const [swiped, blockedByMe, blockedMe] = await Promise.all([
    prisma.swipe.findMany({ where: { fromUserId: userId }, select: { toUserId: true } }),
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ])
  const ids = new Set<string>([userId])
  swiped.forEach(s => ids.add(s.toUserId))
  blockedByMe.forEach(b => ids.add(b.blockedId))
  blockedMe.forEach(b => ids.add(b.blockerId))
  return ids
}

deckRouter.get('/', async (req: AuthedRequest, res) => {
  const me = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } })
  const exclude = await excludedIds(req.userId!)

  const candidates = await prisma.user.findMany({
    where: { id: { notIn: [...exclude] } },
    include: { prompts: true, photos: true },
    take: 200,
  })

  const scored = candidates
    .map(c => ({ user: c, compat: computeCompatibility(me, c) }))
    .sort((a, b) => b.compat.score - a.compat.score)
    .slice(0, POOL_SIZE)

  const picked = seededShuffle(scored, `${todaySeed()}:${req.userId}`).slice(0, DECK_SIZE)
  picked.sort((a, b) => b.compat.score - a.compat.score)

  res.json({
    deck: picked.map(p => ({ ...publicUser(p.user), score: p.compat.score, compat: p.compat.rows })),
  })
})

deckRouter.post('/swipe', async (req: AuthedRequest, res) => {
  const { toUserId, action } = req.body ?? {}
  if (typeof toUserId !== 'string' || !['LIKE', 'PASS', 'ROSE'].includes(action)) {
    return res.status(400).json({ error: 'toUserId and a valid action are required' })
  }
  if (toUserId === req.userId) return res.status(400).json({ error: "you can't swipe on yourself" })

  const target = await prisma.user.findUnique({ where: { id: toUserId } })
  if (!target) return res.status(404).json({ error: 'profile not found' })

  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: req.userId!, toUserId } },
    update: { action },
    create: { fromUserId: req.userId!, toUserId, action },
  })

  if (action === 'PASS') return res.json({ matched: false })

  const reciprocal = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: req.userId! } },
  })
  const mutual = reciprocal && (reciprocal.action === 'LIKE' || reciprocal.action === 'ROSE')
  if (!mutual) return res.json({ matched: false })

  const [userAId, userBId] = [req.userId!, toUserId].sort()
  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  })

  const me = await prisma.user.findUniqueOrThrow({ where: { id: req.userId }, include: { prompts: true, photos: true } })
  getIO().to(`user:${toUserId}`).emit('match', { matchId: match.id, user: publicUser(me) })

  res.json({ matched: true, matchId: match.id, matchedUser: publicUser(target) })
})

deckRouter.delete('/swipe/:targetUserId', async (req: AuthedRequest, res) => {
  const { targetUserId } = req.params
  const existing = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: req.userId!, toUserId: targetUserId } },
  })
  if (!existing) return res.json({ ok: true })

  const [userAId, userBId] = [req.userId!, targetUserId].sort()
  const match = await prisma.match.findUnique({ where: { userAId_userBId: { userAId, userBId } } })
  if (match) return res.status(409).json({ error: 'already matched — swipe cannot be undone' })

  await prisma.swipe.delete({ where: { fromUserId_toUserId: { fromUserId: req.userId!, toUserId: targetUserId } } })
  res.json({ ok: true })
})

deckRouter.post('/reset', async (req: AuthedRequest, res) => {
  const keep = await matchedPartnerIds(req.userId!)
  await prisma.swipe.deleteMany({
    where: { fromUserId: req.userId, toUserId: { notIn: [...keep] } },
  })
  res.json({ ok: true })
})
