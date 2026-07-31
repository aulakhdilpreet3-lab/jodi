import { useEffect, useRef, useState } from 'react'

export function useAudioPlayer(url: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [url])

  const toggle = () => {
    if (!url) return
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.addEventListener('ended', () => setPlaying(false))
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      void audioRef.current.play()
      setPlaying(true)
    }
  }

  return { playing, toggle }
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec || !Number.isFinite(sec)) return '0:00'
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
