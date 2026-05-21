/**
 * useVoiceRecorder
 *
 * Wraps the browser MediaRecorder API. On stop, POSTs the recorded blob
 * to ElevenLabs Scribe v2 and returns the transcript text.
 *
 * State machine: idle → recording → processing → done | error
 */

import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/lib/elevenlabs';

export type RecorderState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

export interface UseVoiceRecorderResult {
  state: RecorderState;
  transcript: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [state,      setState]      = useState<RecorderState>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const streamRef   = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript(null);
      chunksRef.current = [];

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;

      // Pick best supported container — ElevenLabs accepts webm and ogg
      const mimeType =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
        MediaRecorder.isTypeSupported('audio/webm')             ? 'audio/webm' :
                                                                  'audio/ogg';

      const recorder = new MediaRecorder(mediaStream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Release the mic immediately
        streamRef.current?.getTracks().forEach(t => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        setState('processing');

        try {
          const text = await transcribeAudio(blob);
          setTranscript(text);
          setState('done');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Transcription failed';
          setError(msg);
          setState('error');
        }
      };

      recorder.start();
      setState('recording');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not access microphone';
      setError(msg);
      setState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    // Safety: if still recording, stop and release mic
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    chunksRef.current = [];
    setState('idle');
    setTranscript(null);
    setError(null);
  }, []);

  return { state, transcript, error, startRecording, stopRecording, reset };
}
