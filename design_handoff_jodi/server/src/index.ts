import { createServer } from 'node:http'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { JWT_SECRET } from './auth.js'
import { prisma } from './db.js'
import { setIO } from './io.js'
import { markOffline, markOnline } from './lib/presence.js'
import { authRouter } from './routes/auth.js'
import { deckRouter } from './routes/deck.js'
import { likesRouter } from './routes/likes.js'
import { matchesRouter } from './routes/matches.js'
import { messagesRouter } from './routes/messages.js'
import { profileRouter } from './routes/profile.js'
import { safetyRouter } from './routes/safety.js'
import { UPLOAD_ROOT } from './upload.js'

const PORT = Number(process.env.PORT) || 4000

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(UPLOAD_ROOT))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/deck', deckRouter)
app.use('/api/likes', likesRouter)
app.use('/api/matches', matchesRouter)
app.use('/api/matches', messagesRouter)
app.use('/api', safetyRouter)

const clientDist = path.join(process.cwd(), '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
  res.sendFile(path.join(clientDist, 'index.html'), err => { if (err) next() })
})

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })
setIO(io)

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (typeof token !== 'string') return next(new Error('unauthorized'))
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
    socket.data.userId = payload.sub
    next()
  } catch {
    next(new Error('unauthorized'))
  }
})

io.on('connection', socket => {
  const userId: string = socket.data.userId
  markOnline(userId, socket.id)
  socket.join(`user:${userId}`)

  socket.on('join_match', async (matchId: string) => {
    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (match && (match.userAId === userId || match.userBId === userId)) {
      socket.join(`match:${matchId}`)
    }
  })

  socket.on('typing', ({ matchId, isTyping }: { matchId: string; isTyping: boolean }) => {
    socket.to(`match:${matchId}`).emit('typing', { matchId, userId, isTyping: !!isTyping })
  })

  socket.on('disconnect', () => {
    markOffline(userId, socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log(`jodi server listening on http://localhost:${PORT}`)
})
