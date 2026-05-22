import { useMrFox } from '@/hooks/useMrFox';
import { MrFoxModal } from './MrFoxModal';

/**
 * "Talk to Mr. Fox" entry point.
 * Renders a pill-shaped button in the header (left of VoiceSearchBar).
 * When clicked, opens the MrFoxModal and starts an ElevenLabs session.
 */
export function MrFoxButton() {
  const { isOpen, open, close, foxStatus, isSpeaking } = useMrFox();

  const isActive = isOpen || foxStatus === 'connecting' || foxStatus === 'connected';

  return (
    <>
      <button
        onClick={isActive ? undefined : open}
        disabled={isActive}
        aria-label="Talk to Mr. Fox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 44,
          padding: '0 18px',
          borderRadius: 9999,
          border: isActive
            ? '1px solid hsl(var(--primary))'
            : '1px solid hsl(var(--primary) / 0.4)',
          background: isActive
            ? 'hsl(var(--primary) / 0.1)'
            : 'transparent',
          color: isActive
            ? 'hsl(var(--primary))'
            : 'hsl(var(--foreground))',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: isActive ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'border-color 0.2s, background 0.2s, color 0.2s',
          opacity: 1,
        }}
        onMouseEnter={e => {
          if (isActive) return;
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = 'hsl(var(--primary))';
          btn.style.color = 'hsl(var(--primary))';
          btn.style.background = 'hsl(var(--primary) / 0.06)';
        }}
        onMouseLeave={e => {
          if (isActive) return;
          const btn = e.currentTarget as HTMLButtonElement;
          btn.style.borderColor = 'hsl(var(--primary) / 0.4)';
          btn.style.color = 'hsl(var(--foreground))';
          btn.style.background = 'transparent';
        }}
      >
        <span style={{ fontSize: 16 }}>🦊</span>
        <span>{isActive ? 'In Session' : 'Talk to Mr. Fox'}</span>
      </button>

      {isOpen && (
        <MrFoxModal
          status={foxStatus}
          isSpeaking={isSpeaking}
          onClose={close}
        />
      )}
    </>
  );
}
