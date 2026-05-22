import { useEffect, useRef } from 'react';
import type { MrFoxStatus } from '@/hooks/useMrFox';

interface MrFoxModalProps {
  status: MrFoxStatus;
  isSpeaking: boolean;
  onClose: () => void;
}

// ── Waveform bar animation ────────────────────────────────────────────────────
// Five bars that animate when the agent is speaking.
function WaveformBars({ active }: { active: boolean }) {
  const bars = [
    { height: '60%', delay: '0ms' },
    { height: '85%', delay: '80ms' },
    { height: '45%', delay: '160ms' },
    { height: '70%', delay: '240ms' },
    { height: '55%', delay: '320ms' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 40,
      }}
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: active ? bar.height : '20%',
            borderRadius: 9999,
            background: 'hsl(var(--primary))',
            opacity: active ? 1 : 0.35,
            transition: active
              ? 'none'
              : 'height 0.4s ease, opacity 0.4s ease',
            animation: active
              ? `mrfox-bar 0.9s ease-in-out ${bar.delay} infinite alternate`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes mrfox-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1);   }
        }
      `}</style>
    </div>
  );
}

// ── Pulsing listening dot ─────────────────────────────────────────────────────
function ListeningDot() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'hsl(var(--primary))',
          animation: 'mrfox-pulse 1.4s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes mrfox-pulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

// ── Status label ──────────────────────────────────────────────────────────────
function statusLabel(status: MrFoxStatus, isSpeaking: boolean): string {
  if (status === 'connecting') return 'Connecting…';
  if (status === 'error')      return 'Disconnected';
  if (isSpeaking)              return 'Speaking…';
  return 'Listening…';
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function MrFoxModal({ status, isSpeaking, onClose }: MrFoxModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal and close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    cardRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    /* ── Backdrop ── */
    <div
      role="presentation"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* ── Card ── */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Talk to Mr. Fox"
        tabIndex={-1}
        style={{
          outline: 'none',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 16,
          padding: '32px 28px 24px',
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Fox emoji + title ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>🦊</div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display, "Playfair Display", serif)',
              fontSize: 22,
              fontWeight: 600,
              color: 'hsl(var(--primary))',
              letterSpacing: '-0.01em',
            }}
          >
            Mr. Fox
          </h2>
        </div>

        {/* ── Waveform / listening visualiser ── */}
        <div style={{ width: '100%' }}>
          {isSpeaking
            ? <WaveformBars active />
            : <div style={{ display: 'flex', justifyContent: 'center' }}>
                {status === 'connected' && <ListeningDot />}
              </div>
          }
        </div>

        {/* ── Status text ── */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'hsl(var(--muted-foreground))',
            letterSpacing: '0.02em',
          }}
        >
          {statusLabel(status, isSpeaking)}
        </p>

        {/* ── End Session button ── */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 9999,
            border: '1px solid hsl(var(--border))',
            background: 'transparent',
            color: 'hsl(var(--muted-foreground))',
            fontSize: 13,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--primary))';
            (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--primary))';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--border))';
            (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--muted-foreground))';
          }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
