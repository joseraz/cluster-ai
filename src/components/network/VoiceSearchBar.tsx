/**
 * VoiceSearchBar
 *
 * Floating pill bar at the top-center of the OrbitalCanvas.
 * Supports both typed queries and ElevenLabs realtime voice input.
 *
 * States:
 *   idle       → default, mic + placeholder text
 *   listening  → mic active, live transcript streams in
 *   processing → spinner while transcription finalises
 *   active     → query submitted, results showing
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, X, Search, Loader2 } from 'lucide-react';
import { useRealtimeVoiceRecorder } from '@/hooks/useRealtimeVoiceRecorder';

// ── Types ──────────────────────────────────────────────────────────────────────

interface VoiceSearchBarProps {
  onSubmit: (query: string) => void;
  onClear:  () => void;
  activeQuery: string | null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function VoiceSearchBar({ onSubmit, onClear, activeQuery }: VoiceSearchBarProps) {
  const [localText,  setLocalText]  = useState('');
  const [barMode,    setBarMode]    = useState<'idle' | 'listening' | 'processing' | 'active'>('idle');
  const inputRef     = useRef<HTMLInputElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    state: voiceState,
    liveText,
    lastCommittedSegment,
    sessionTranscript,
    start:  startVoice,
    stop:   stopVoice,
    reset:  resetVoice,
  } = useRealtimeVoiceRecorder();

  // ── Sync voice state → bar mode ────────────────────────────────────────────
  useEffect(() => {
    if (voiceState === 'connecting' || voiceState === 'listening') {
      setBarMode('listening');
    } else if (voiceState === 'idle' && barMode === 'listening') {
      // Voice stopped — if we have transcript, move to processing briefly
      if (sessionTranscript.trim().length > 0) {
        setBarMode('processing');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState]);

  // ── Live text → input field ────────────────────────────────────────────────
  useEffect(() => {
    if (liveText && barMode === 'listening') {
      setLocalText(liveText);
    }
  }, [liveText, barMode]);

  // ── Auto-submit on committed segment (800ms debounce) ─────────────────────
  useEffect(() => {
    if (!lastCommittedSegment || lastCommittedSegment.length <= 3) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Use full session transcript for multi-segment queries
      const finalQuery = sessionTranscript || lastCommittedSegment;
      stopVoice();
      handleSubmit(finalQuery);
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCommittedSegment]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLocalText(trimmed);
    setBarMode('active');
    onSubmit(trimmed);
    resetVoice();
  }, [onSubmit, resetVoice]);

  // ── Clear handler ──────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    stopVoice();
    resetVoice();
    setLocalText('');
    setBarMode('idle');
    onClear();
  }, [stopVoice, resetVoice, onClear]);

  // ── Mic button ─────────────────────────────────────────────────────────────
  const handleMicClick = useCallback(async () => {
    if (barMode === 'active') {
      handleClear();
      return;
    }
    if (barMode === 'listening') {
      // Manual stop → trigger auto-submit path
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopVoice();
      const query = sessionTranscript || localText;
      if (query.trim()) {
        handleSubmit(query);
      } else {
        setBarMode('idle');
        resetVoice();
      }
      return;
    }
    // idle → start listening
    setLocalText('');
    try {
      await startVoice();
    } catch {
      setBarMode('idle');
    }
  }, [barMode, handleClear, handleSubmit, localText, resetVoice, sessionTranscript, startVoice, stopVoice]);

  // ── Keyboard: Enter to submit typed query ──────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = localText.trim();
      if (q) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        handleSubmit(q);
      }
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [localText, handleSubmit, handleClear]);

  // ── Sync activeQuery prop → local state (parent cleared externally) ────────
  useEffect(() => {
    if (activeQuery === null && barMode === 'active') {
      setLocalText('');
      setBarMode('idle');
    } else if (activeQuery !== null && barMode !== 'active') {
      setLocalText(activeQuery);
      setBarMode('active');
    }
  }, [activeQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived display values ─────────────────────────────────────────────────
  const isListening  = barMode === 'listening';
  const isProcessing = barMode === 'processing';
  const isActive     = barMode === 'active';

  const displayText = isListening ? liveText || localText : localText;
  const placeholder = isListening  ? 'Listening…'
                    : isProcessing ? 'Processing…'
                    : 'Search your network…';

  // ── Styles ─────────────────────────────────────────────────────────────────
  const pillBg    = 'rgba(36,31,28,0.88)';
  const borderColor = isListening
    ? 'rgba(201,169,110,0.60)'
    : isActive
    ? 'rgba(201,169,110,0.45)'
    : 'rgba(201,169,110,0.18)';

  return (
    <div
      className="relative flex items-center w-full"
      style={{
        maxWidth: isListening ? 560 : 480,
        transition: 'max-width 300ms ease',
      }}
    >
      {/* ── Listening pulse ring ── */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1.5px solid rgba(201,169,110,0.55)',
            borderRadius: 9999,
            animation: 'voice-pulse 1.4s ease-out infinite',
          }}
        />
      )}

      <div
        className="flex items-center w-full rounded-full px-3 gap-2"
        style={{
          height: 44,
          background: pillBg,
          border: `1.5px solid ${borderColor}`,
          transition: 'border-color 300ms ease',
          backdropFilter: 'blur(12px)',
          boxShadow: isListening
            ? '0 0 0 3px rgba(201,169,110,0.10), 0 4px 24px rgba(0,0,0,0.35)'
            : '0 4px 20px rgba(0,0,0,0.30)',
        }}
      >
        {/* ── Mic / Search icon button ── */}
        <button
          onClick={handleMicClick}
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors"
          style={{
            color: isListening ? '#C9A96E' : 'rgba(199,184,163,0.7)',
            background: isListening ? 'rgba(201,169,110,0.12)' : 'transparent',
          }}
          title={isListening ? 'Stop recording' : 'Start voice search'}
          aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* ── Text input ── */}
        <input
          ref={inputRef}
          type="text"
          value={displayText}
          onChange={e => {
            if (!isListening && !isProcessing) setLocalText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isListening || isProcessing}
          className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
          style={{
            color: isListening
              ? 'rgba(201,169,110,0.85)'
              : isActive
              ? 'rgba(250,246,240,0.95)'
              : 'rgba(199,184,163,0.9)',
            fontStyle: isListening ? 'italic' : 'normal',
            caretColor: '#C9A96E',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            letterSpacing: '0.01em',
          }}
          aria-label="Search your network"
          autoComplete="off"
          spellCheck={false}
        />

        {/* ── Right side: spinner | clear | search icon ── */}
        {isProcessing ? (
          <Loader2
            className="flex-shrink-0 w-4 h-4 animate-spin"
            style={{ color: 'rgba(201,169,110,0.7)' }}
          />
        ) : isActive || localText.length > 0 ? (
          <button
            onClick={handleClear}
            className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
            style={{ color: 'rgba(199,184,163,0.6)' }}
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Search
            className="flex-shrink-0 w-3.5 h-3.5"
            style={{ color: 'rgba(199,184,163,0.35)', pointerEvents: 'none' }}
          />
        )}
      </div>

      {/* ── Active query label (thin gold underline) ── */}
      {isActive && (
        <div
          className="absolute bottom-0 left-1/2 h-px rounded-full"
          style={{
            transform: 'translateX(-50%)',
            width: '60%',
            background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.6), transparent)',
          }}
        />
      )}
    </div>
  );
}
