import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  onSubmit: (query: string) => void;
  onClear:  () => void;
  activeQuery: string | null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function SearchBar({ onSubmit, onClear, activeQuery }: SearchBarProps) {
  const [localText, setLocalText] = useState('');
  const [isActive,  setIsActive]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLocalText(trimmed);
    setIsActive(true);
    onSubmit(trimmed);
  }, [onSubmit]);

  // ── Clear handler ──────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setLocalText('');
    setIsActive(false);
    onClear();
  }, [onClear]);

  // ── Keyboard: Enter to submit, Escape to clear ─────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = localText.trim();
      if (q) handleSubmit(q);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [localText, handleSubmit, handleClear]);

  // ── Sync activeQuery prop → local state (parent cleared externally) ────────
  useEffect(() => {
    if (activeQuery === null && isActive) {
      setLocalText('');
      setIsActive(false);
    } else if (activeQuery !== null && !isActive) {
      setLocalText(activeQuery);
      setIsActive(true);
    }
  }, [activeQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Styles ─────────────────────────────────────────────────────────────────
  const pillBg      = 'rgba(36,31,28,0.88)';
  const borderColor = isActive
    ? 'rgba(201,169,110,0.45)'
    : 'rgba(201,169,110,0.18)';

  return (
    <div
      className="relative flex items-center w-full"
      style={{ maxWidth: 480 }}
    >
      <div
        className="flex items-center w-full rounded-full px-3 gap-2"
        style={{
          height: 44,
          background: pillBg,
          border: `1.5px solid ${borderColor}`,
          transition: 'border-color 300ms ease',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.30)',
        }}
      >
        {/* ── Text input ── */}
        <input
          ref={inputRef}
          type="text"
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search your network…"
          className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
          style={{
            color: isActive
              ? 'rgba(250,246,240,0.95)'
              : 'rgba(199,184,163,0.9)',
            caretColor: '#C9A96E',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            letterSpacing: '0.01em',
          }}
          aria-label="Search your network"
          autoComplete="off"
          spellCheck={false}
        />

        {/* ── Right side: clear button or search icon ── */}
        {isActive || localText.length > 0 ? (
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

      {/* ── Active query underline ── */}
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
