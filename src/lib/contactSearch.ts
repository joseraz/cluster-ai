/**
 * contactSearch.ts
 *
 * Client-side semantic search over the contact graph.
 *
 * searchContacts() scores every contact against a free-text query by
 * matching across name, connectionType, livesIn, howWeMet, company,
 * education, and interests fields. Results are sorted by relevance.
 *
 * highlightExcerpt() wraps matching tokens in <mark> spans for display.
 */

import type { Contact, ConnectionType } from '@/types/contact';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SearchMatch {
  field: string;     // e.g. 'connectionType', 'livesIn', 'howWeMet'
  label: string;     // human-readable label, e.g. 'How you met'
  excerpt: string;   // the raw text to highlight
}

export interface SearchResult {
  contact: Contact;
  score: number;
  matches: SearchMatch[];
}

// ── Stop words ─────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'i', 'my', 'me', 'we', 'us', 'who', 'all', 'are',
  'is', 'in', 'on', 'at', 'to', 'do', 'of', 'for', 'and', 'or', 'with',
  'that', 'this', 'show', 'tell', 'find', 'get', 'give', 'list', 'their',
  'they', 'them', 'any', 'some', 'from', 'have', 'how', 'what', 'where',
  'when', 'were', 'was', 'has', 'had', 'live', 'lives', 'living', 'met',
  'meet', 'know', 'knew', 'through', 'via', 'by',
]);

// ── Connection type synonyms ────────────────────────────────────────────────────

const CONNECTION_SYNONYMS: Record<string, ConnectionType> = {
  friend:        'friend',
  friends:       'friend',
  buddy:         'friend',
  buddies:       'friend',
  colleague:     'colleague',
  colleagues:    'colleague',
  coworker:      'colleague',
  coworkers:     'colleague',
  'co-worker':   'colleague',
  workmate:      'colleague',
  mentor:        'mentor',
  mentors:       'mentor',
  advisor:       'mentor',
  advisors:      'mentor',
  client:        'client',
  clients:       'client',
  customer:      'client',
  customers:     'client',
  partner:       'partner',
  partners:      'partner',
  family:        'family',
  relative:      'family',
  relatives:     'family',
  investor:      'investor',
  investors:     'investor',
  backer:        'investor',
  backers:       'investor',
  acquaintance:  'acquaintance',
  acquaintances: 'acquaintance',
  contact:       'acquaintance',
};

// ── Levenshtein distance (edit distance) ───────────────────────────────────────

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  // Only worth computing for short strings — skip long tokens for performance
  if (Math.abs(a.length - b.length) > 2) return 99;

  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[a.length][b.length];
}

// ── Tokeniser ──────────────────────────────────────────────────────────────────

export function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// ── Field text matching ────────────────────────────────────────────────────────

/** Returns true if any token is a substring of text, or within edit distance 1 of
 *  a word in text (for fuzzy near-misses from voice transcription). */
function textMatchesAny(text: string, tokens: string[]): boolean {
  const lc = text.toLowerCase();
  for (const tok of tokens) {
    if (lc.includes(tok)) return true;
    // Fuzzy: check each word in the text against the token
    const words = lc.split(/\s+/);
    for (const word of words) {
      if (word.length >= 3 && tok.length >= 3 && levenshtein(tok, word) <= 1) return true;
    }
  }
  return false;
}

// ── Main search function ───────────────────────────────────────────────────────

export function searchContacts(rawQuery: string, contacts: Contact[]): SearchResult[] {
  if (!rawQuery.trim()) return [];

  const tokens = tokenize(rawQuery);
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const contact of contacts) {
    let score = 0;
    const matches: SearchMatch[] = [];

    // ── Name matching ──────────────────────────────────────────────────────────
    const firstName = contact.firstName.toLowerCase();
    const lastName  = contact.lastName.toLowerCase();
    const fullName  = `${firstName} ${lastName}`;
    let nameMatched = false;

    for (const tok of tokens) {
      if (
        fullName.includes(tok) ||
        (tok.length >= 3 && (levenshtein(tok, firstName) <= 1 || levenshtein(tok, lastName) <= 1))
      ) {
        if (!nameMatched) {
          score += 10;
          matches.push({
            field:   'name',
            label:   'Name',
            excerpt: `${contact.firstName} ${contact.lastName}`,
          });
          nameMatched = true;
        }
      }
    }

    // ── Connection type intent matching ────────────────────────────────────────
    for (const tok of tokens) {
      const mappedType = CONNECTION_SYNONYMS[tok];
      if (mappedType && contact.connectionType === mappedType) {
        score += 12;
        matches.push({
          field:   'connectionType',
          label:   'Connection',
          excerpt: contact.connectionType,
        });
        break; // only match once
      }
    }

    // ── Location matching ──────────────────────────────────────────────────────
    if (contact.livesIn && textMatchesAny(contact.livesIn, tokens)) {
      score += 10;
      matches.push({
        field:   'livesIn',
        label:   'Lives in',
        excerpt: contact.livesIn,
      });
    }

    // ── How we met ─────────────────────────────────────────────────────────────
    if (contact.howWeMet && textMatchesAny(contact.howWeMet, tokens)) {
      score += 8;
      matches.push({
        field:   'howWeMet',
        label:   'How you met',
        excerpt: contact.howWeMet,
      });
    }

    // ── Company ───────────────────────────────────────────────────────────────
    if (contact.company && textMatchesAny(contact.company, tokens)) {
      score += 6;
      matches.push({
        field:   'company',
        label:   'Works at',
        excerpt: contact.company,
      });
    }

    // ── Education ─────────────────────────────────────────────────────────────
    if (contact.education?.institution && textMatchesAny(contact.education.institution, tokens)) {
      score += 6;
      matches.push({
        field:   'education',
        label:   'Education',
        excerpt: contact.education.institution,
      });
    }

    // ── Interests ─────────────────────────────────────────────────────────────
    const interestFields: Array<{ key: keyof NonNullable<Contact['interests']>; label: string }> = [
      { key: 'about',        label: 'About'          },
      { key: 'hobbies',      label: 'Interests'      },
      { key: 'favouriteFood',label: 'Favourite food'  },
    ];

    for (const { key, label } of interestFields) {
      const val = contact.interests?.[key];
      if (val && textMatchesAny(val, tokens)) {
        score += 4;
        matches.push({ field: `interests.${key}`, label, excerpt: val });
        break; // one interests match per contact is enough
      }
    }

    if (score > 0) {
      results.push({ contact, score, matches });
    }
  }

  // Sort by score descending, then alphabetically by name for ties
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return `${a.contact.firstName} ${a.contact.lastName}`.localeCompare(
      `${b.contact.firstName} ${b.contact.lastName}`,
    );
  });
}

// ── Highlight helper ───────────────────────────────────────────────────────────

/**
 * Splits `text` into segments that either match a token or don't.
 * Returns an array of { text, highlighted } for rendering.
 */
export function getHighlightSegments(
  text: string,
  tokens: string[],
): { text: string; highlighted: boolean }[] {
  if (tokens.length === 0) return [{ text, highlighted: false }];

  // Build a single regex that matches any token (case-insensitive)
  const pattern = tokens
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex chars
    .join('|');

  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter(p => p.length > 0)
    .map(part => ({
      text:        part,
      highlighted: regex.test(part),
    }));
}
