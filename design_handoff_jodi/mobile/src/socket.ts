import { io, type Socket } from 'socket.io-client'
import { API_URL, getToken } from './api'

let socket: Socket | null = null

export function connectSocket(): Socket {
  if (socket) return socket
  socket = io(API_URL, {
    autoConnect: true,
    // socket.io-client calls this before each (re)connection attempt, which
    // lets the token lookup stay async (AsyncStorage has no sync API).
    auth: (cb) => { getToken().then(token => cb({ token })) },
  })
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}
