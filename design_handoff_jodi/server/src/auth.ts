import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me'

if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET not set — using an insecure dev default. Set JWT_SECRET before deploying.')
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' })
}

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'not authenticated' })
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' })
  }
}

export function minAge(birthdate: Date, years: number): boolean {
  const now = new Date()
  const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate())
  return birthdate <= cutoff
}

export function ageFromBirthdate(birthdate: Date): number {
  const now = new Date()
  let age = now.getFullYear() - birthdate.getFullYear()
  const m = now.getMonth() - birthdate.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birthdate.getDate())) age--
  return age
}
