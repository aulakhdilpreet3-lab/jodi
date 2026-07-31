import { useState } from 'react'
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio'

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(recorder)
  const [result, setResult] = useState<{ uri: string; durationSec: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setError(null)
    setResult(null)
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync()
      if (!perm.granted) {
        setError('microphone access was denied')
        return
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
      await recorder.prepareToRecordAsync()
      recorder.record()
    } catch {
      setError('could not start recording')
    }
  }

  const stop = async () => {
    const durationSec = recorder.currentTime
    await recorder.stop()
    if (recorder.uri) setResult({ uri: recorder.uri, durationSec })
  }

  const reset = () => setResult(null)

  return { recording: recorderState.isRecording, result, error, start, stop, reset }
}
