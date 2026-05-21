/**
 * SearchResultCard
 *
 * Individual contact card shown during the search results list view.
 * Rendered and positioned by OrbitalCanvas — this component is purely visual.
 * Highlights the specific fields that matched the search query.
 */

import { Mail, MessageSquare, ExternalLink, MapPin, Users, Briefcase, GraduationCap, Star } from 'lucide-react';
import type { SearchResult } from '@/lib/contactSearch';
import { getHighlightSegments } from '@/lib/contactSearch';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchResultCardProps {
  result: SearchResult;
  queryTokens: string[];
  onCardClick?: (contactId: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const CONNECTION_LABELS: Record<string, string> = {
  colleague:    'Colleague',
  friend:       'Friend',
  mentor:       'Mentor',
  client:       'Client',
  partner:      'Partner',
  family:       'Family',
  investor:     'Investor',
  acquaintance: 'Acquaintance',
};

function StrengthDots({ value }: { value?: number }) {
  if (!value) return null;
  const total  = 5;
  const filled = Math.round((value / 10) * total);
  return (
    <span className="flex items-center gap-0.5" title={`Connection strength: ${value}/10`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i < filled ? 'rgba(201,169,110,0.80)' : 'rgba(201,169,110,0.20)' }}
        />
      ))}
    </span>
  );
}

/** Renders text with token matches highlighted in gold. */
function HighlightedText({ text, tokens }: { text: string; tokens: string[] }) {
  const segments = getHighlightSegments(text, tokens);
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark
            key={i}
            style={{
              background: 'rgba(201,169,110,0.22)',
              color: '#C9A96E',
              borderRadius: 3,
              padding: '0 2px',
            }}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

function FieldIcon({ field }: { field: string }) {
  const style = { width: 11, height: 11, flexShrink: 0, color: 'rgba(199,184,163,0.50)' } as const;
  if (field === 'livesIn')        return <MapPin         {...style} />;
  if (field === 'connectionType') return <Users          {...style} />;
  if (field === 'howWeMet')       return <Star           {...style} />;
  if (field === 'company')        return <Briefcase      {...style} />;
  if (field === 'education')      return <GraduationCap  {...style} />;
  return null;
}

const MATCH_PRIORITY = ['connectionType', 'livesIn', 'howWeMet', 'company', 'education', 'name'];

function sortMatches(matches: SearchResult['matches']): SearchResult['matches'] {
  return [...matches].sort((a, b) => {
    const ai = MATCH_PRIORITY.indexOf(a.field);
    const bi = MATCH_PRIORITY.indexOf(b.field);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export function SearchResultCard({ result, queryTokens, onCardClick }: SearchResultCardProps) {
  const { contact, matches } = result;
  const sortedMatches  = sortMatches(matches);
  const displayMatches = sortedMatches.slice(0, 2); // max 2 match lines per card
  const initials       = getInitials(contact.firstName, contact.lastName);
  const socialLinks    = (contact.socialLinks ?? []).filter(Boolean);

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        width: 340,
        background: 'rgba(34,29,26,0.97)',
        border: '1px solid rgba(201,169,110,0.22)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
        backdropFilter: 'blur(18px)',
      }}
      onClick={() => onCardClick?.(contact.id)}
    >
      {/* ── Main content ── */}
      <div className="px-4 pt-3.5 pb-3">

        {/* Header: avatar + name + strength dots */}
        <div className="flex items-center gap-3 mb-2.5">
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold"
            style={{
              background: 'rgba(201,169,110,0.14)',
              color: '#C9A96E',
              border: '1px solid rgba(201,169,110,0.25)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p
                className="text-sm font-semibold truncate leading-tight"
                style={{ color: '#FAF6F0', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {contact.firstName} {contact.lastName}
              </p>
              <StrengthDots value={contact.connectionStrength} />
            </div>
            {contact.company && (
              <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(199,184,163,0.50)' }}>
                {contact.company}
              </p>
            )}
          </div>
        </div>

        {/* Match highlights */}
        <div className="flex flex-col gap-1.5">
          {displayMatches.map(match => (
            <div key={match.field} className="flex items-start gap-1.5">
              <span className="mt-0.5">
                <FieldIcon field={match.field} />
              </span>
              <p className="text-xs leading-relaxed flex-1 min-w-0" style={{ color: 'rgba(199,184,163,0.75)' }}>
                <span
                  className="mr-1"
                  style={{
                    color: 'rgba(199,184,163,0.40)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {match.label}
                </span>
                <HighlightedText text={match.excerpt} tokens={queryTokens} />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action row ── */}
      <div
        className="flex items-center gap-1.5 px-4 py-2.5"
        style={{
          borderTop: '1px solid rgba(201,169,110,0.10)',
          background: 'rgba(22,19,17,0.50)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <ActionButton
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          disabled
          title="Draft email — coming soon"
        />
        <ActionButton
          icon={<MessageSquare className="w-3.5 h-3.5" />}
          label="Message"
          disabled
          title="Send message — coming soon"
        />

        {socialLinks.length > 0 && (
          <div className="flex items-center gap-1 ml-1">
            {socialLinks.slice(0, 3).map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:bg-primary/10"
                style={{ color: 'rgba(199,184,163,0.55)', border: '1px solid rgba(201,169,110,0.15)' }}
                title={url}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        )}

        {/* Connection type badge — right-aligned */}
        {contact.connectionType && (
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{
              color: '#C9A96E',
              border: '1px solid rgba(201,169,110,0.28)',
              background: 'rgba(201,169,110,0.07)',
              fontSize: 10,
              letterSpacing: '0.04em',
            }}
          >
            {CONNECTION_LABELS[contact.connectionType] ?? contact.connectionType}
          </span>
        )}
      </div>
    </div>
  );
}

// ── ActionButton ───────────────────────────────────────────────────────────────

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}

function ActionButton({ icon, label, disabled, onClick, title }: ActionButtonProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title ?? label}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
      style={{
        color:      disabled ? 'rgba(199,184,163,0.28)' : 'rgba(199,184,163,0.65)',
        border:     `1px solid ${disabled ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.18)'}`,
        background: 'transparent',
        cursor:     disabled ? 'default' : 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize:   11,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
