import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { mediaUrl } from './api'

// Plays a remote voice-intro clip (someone else's, or the user's own).
export function useSoundPlayer(url: string | null) {
  const player = useAudioPlayer(mediaUrl(url) ?? undefined)
  const status = useAudioPlayerStatus(player)

  const toggle = () => {
    if (!url) return
    if (status.playing) {
      player.pause()
      return
    }
    if (status.duration > 0 && status.currentTime >= status.duration - 0.05) {
      player.seekTo(0)
    }
    player.play()
  }

  return { playing: status.playing, toggle }
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec || !Number.isFinite(sec)) return '0:00'
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
