import { useRef, useState } from 'react'

function readBlobDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    audio.src = URL.createObjectURL(blob)
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        resolve(audio.duration)
        URL.revokeObjectURL(audio.src)
        return
      }
      // Chrome quirk: recorded webm blobs report Infinity until you seek once.
      audio.currentTime = 1e101
      audio.ontimeupdate = () => {
        audio.ontimeupdate = null
        resolve(audio.duration === Infinity ? 0 : audio.duration)
        URL.revokeObjectURL(audio.src)
      }
    }
    audio.onerror = () => resolve(0)
  })
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; durationSec: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const start = async () => {
    setError(null)
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const durationSec = await readBlobDuration(blob)
        setResult({ blob, durationSec })
        streamRef.current?.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setError('microphone access was denied or unavailable')
    }
  }

  const stop = () => {
    recorderRef.current?.stop()
    setRecording(false)
  }

  const reset = () => setResult(null)

  return { recording, result, error, start, stop, reset }
}
