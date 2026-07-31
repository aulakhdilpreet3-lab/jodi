const online = new Map<string, Set<string>>()

export function markOnline(userId: string, socketId: string) {
  if (!online.has(userId)) online.set(userId, new Set())
  online.get(userId)!.add(socketId)
}

export function markOffline(userId: string, socketId: string) {
  const set = online.get(userId)
  if (!set) return
  set.delete(socketId)
  if (set.size === 0) online.delete(userId)
}

export function isOnline(userId: string): boolean {
  return online.has(userId)
}
