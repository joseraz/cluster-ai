/**
 * useRealtimeVoiceRecorder
 *
 * Connects to the ElevenLabs Scribe v2 Realtime WebSocket endpoint and streams
 * live microphone audio as 16-bit PCM at 16 kHz. The server returns:
 *   - partial_transcript: interim text (clears between commits)
 *   - transcript (final: true): committed segment — triggers field population
 *
 * State machine: idle → connecting → listening → ready | error
 *
 * "ready" = all required contact fields have been filled by voice.
 */

import { useState, useRef, useCallback } from 'react';
import { getRealtimeToken } from '@/lib/elevenlabs';

export type RealtimeState = 'idle' | 'connecting' | 'listening' | 'ready' | 'error';

export interface UseRealtimeVoiceRecorderResult {
  /** Current lifecycle state */
  state: RealtimeState;
  /** Live partial text streaming in as the user speaks (resets on each commit) */
  liveText: string;
  /** All committed/final transcript segments joined together */
  sessionTranscript: string;
  /** The most recently committed segment — consumers watch this to parse fields */
  lastCommittedSegment: string;
  /** Human-readable error message when state === 'error' */
  error: string | null;
  /** Mark as ready externally (called by sheet when all required fields are filled) */
  markReady: () => void;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/* ─── PCM helpers ───────────────────────────────────────────────────────────── */

/** Convert Float32 samples (range -1…1) to 16-bit signed PCM bytes (little-endian). */
function float32ToInt16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  // Process in chunks to avoid call-stack limits on large buffers
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/* ─── hook ──────────────────────────────────────────────────────────────────── */

const SAMPLE_RATE = 16000;
const PROCESSOR_BUFFER = 4096; // ~256ms at 16 kHz — good balance of latency vs overhead
const WS_URL = 'wss://api.elevenlabs.io/v1/speech-to-text/realtime';

export function useRealtimeVoiceRecorder(): UseRealtimeVoiceRecorderResult {
  const [state,               setState]               = useState<RealtimeState>('idle');
  const [liveText,            setLiveText]            = useState('');
  const [sessionTranscript,   setSessionTranscript]   = useState('');
  const [lastCommittedSegment, setLastCommittedSegment] = useState('');
  const [error,               setError]               = useState<string | null>(null);

  const wsRef            = useRef<WebSocket | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const processorRef     = useRef<ScriptProcessorNode | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);

  /* ── cleanup ─────────────────────────────────────────────────────────────── */
  const cleanup = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    if (wsRef.current && wsRef.current.readyState < WebSocket.CLOSING) {
      wsRef.current.close();
    }
    wsRef.current = null;
  }, []);

  /* ── markReady ───────────────────────────────────────────────────────────── */
  const markReady = useCallback(() => {
    setState(s => s === 'listening' ? 'ready' : s);
  }, []);

  /* ── start ───────────────────────────────────────────────────────────────── */
  const start = useCallback(async () => {
    setError(null);
    setLiveText('');
    setSessionTranscript('');
    setLastCommittedSegment('');
    setState('connecting');

    try {
      /* 1. Single-use token (/v1/single-use-token/realtime_scribe → {token}) */
      const token = await getRealtimeToken();

      /* 2. WebSocket — session config goes in query params; the server        */
      /*    sends session_started immediately on connect, no extra message needed */
      const url = `${WS_URL}?token=${encodeURIComponent(token)}&language_code=en&vad_commit_strategy=true`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Session starts automatically — nothing to send here
      };

      ws.onmessage = (event: MessageEvent) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(event.data as string) as Record<string, unknown>;
        } catch {
          return;
        }

        const type = msg.type ?? msg.message_type;

        if (type === 'session_started' || type === 'connected') {
          setState('listening');
          return;
        }

        if (type === 'partial_transcript' || type === 'interim') {
          const text = (msg.text ?? msg.transcript ?? '') as string;
          setLiveText(text);
          return;
        }

        if (type === 'transcript' || type === 'final') {
          const text = (msg.text ?? msg.transcript ?? '') as string;
          if (!text) return;
          setLiveText(''); // clear the live preview
          setLastCommittedSegment(text);
          setSessionTranscript(prev => prev ? `${prev} ${text}` : text);
          return;
        }

        if (type === 'error') {
          const msg2 = (msg.message ?? msg.error ?? 'Unknown error') as string;
          setError(msg2);
          setState('error');
          cleanup();
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection failed');
        setState('error');
        cleanup();
      };

      ws.onclose = (ev) => {
        // Only treat unexpected closes as errors (code 1000 = normal closure)
        if (ev.code !== 1000 && ev.code !== 1005) {
          setError(`Connection closed unexpectedly (${ev.code})`);
          setState(s => s !== 'idle' && s !== 'ready' ? 'error' : s);
        }
        cleanup();
      };

      /* 3. Microphone + AudioContext ----------------------------------------- */
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = ctx;

      const source    = ctx.createMediaStreamSource(mediaStream);
      const processor = ctx.createScriptProcessor(PROCESSOR_BUFFER, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        const pcm    = e.inputBuffer.getChannelData(0);
        const b64    = float32ToInt16Base64(pcm);
        wsRef.current.send(JSON.stringify({
          message_type: 'input_audio_chunk',
          audio_base_64: b64,
          sample_rate: SAMPLE_RATE,
        }));
      };

      source.connect(processor);
      processor.connect(ctx.destination); // required for onaudioprocess to fire

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start voice input';
      setError(msg);
      setState('error');
      cleanup();
    }
  }, [cleanup]);

  /* ── stop ────────────────────────────────────────────────────────────────── */
  const stop = useCallback(() => {
    cleanup();
    setState('idle');
  }, [cleanup]);

  /* ── reset ───────────────────────────────────────────────────────────────── */
  const reset = useCallback(() => {
    cleanup();
    setState('idle');
    setLiveText('');
    setSessionTranscript('');
    setLastCommittedSegment('');
    setError(null);
  }, [cleanup]);

  return {
    state,
    liveText,
    sessionTranscript,
    lastCommittedSegment,
    error,
    markReady,
    start,
    stop,
    reset,
  };
}
