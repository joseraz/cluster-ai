/**
 * Parses a free-form voice transcript into ContactFormData fields.
 *
 * Example inputs:
 *   "Add Marcus Webb, he's an investor I met at the Y Combinator demo day in San Francisco, strong connection"
 *   "Sarah Chen, close friend, we met through mutual friends at university"
 *   "Create contact for James Okafor, colleague, met him at the Davos panel last year"
 */

import type { ContactFormData } from '@/components/contacts/CreateContactSheet';
import type { ConnectionType } from '@/contexts/ContactsContext';

/* ─── keyword maps ─────────────────────────────────────────────────────────── */

const CONNECTION_KEYWORDS: Record<ConnectionType, string[]> = {
  friend:       ['friend', 'buddy', 'pal', 'mate', 'bestie', 'close friend', 'good friend'],
  family:       ['family', 'brother', 'sister', 'mother', 'father', 'cousin', 'relative',
                 'sibling', 'uncle', 'aunt', 'nephew', 'niece', 'spouse', 'wife', 'husband'],
  colleague:    ['colleague', 'coworker', 'co-worker', 'workmate', 'work colleague', 'team member', 'teammate'],
  acquaintance: ['acquaintance', 'barely know', 'casual connection'],
  partner: ['partner', 'lover', 'girlfriend', 'boyfriend', 'wife', 'husband', 'romantic', 'significant other'],
  client:       ['client', 'customer', 'account'],
  investor:     ['investor', 'venture capital', 'vc', 'angel investor', 'backer', 'fund manager'],
  mentor:       ['mentor', 'advisor', 'coach', 'guide', 'mentee'],
};

const STRENGTH_KEYWORDS: Array<{ words: string[]; value: number }> = [
  { words: ['very strong', 'extremely close', 'best friend', 'closest', 'very close', 'incredibly close', 'inseparable', 'lifelong'], value: 5 },
  { words: ['strong', 'close', 'solid', 'great relationship', 'tight'], value: 4 },
  { words: ['moderate', 'medium', 'decent', 'average', 'casual'], value: 3 },
  { words: ['fair', 'light', 'loose', 'occasional'], value: 2 },
  { words: ['weak', 'distant', 'barely', 'hardly', 'not very close'], value: 1 },
];

/* ─── helpers ──────────────────────────────────────────────────────────────── */

function cap(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── parser ───────────────────────────────────────────────────────────────── */

export function parseContactTranscript(text: string): Partial<ContactFormData> {
  const result: Partial<ContactFormData> = {};
  const lower = text.toLowerCase();

  /* — Name ----------------------------------------------------------------- */
  // Priority 1: labelled command patterns — "add John Doe", "contact for Jane Smith"
  const labelledName = text.match(
    /(?:add|create(?:\s+contact(?:\s+for)?)?|contact(?:\s+for)?|for)\s+([A-Z][a-zÀ-ÿ'-]+(?:\s+[A-Z][a-zÀ-ÿ'-]+)+)/,
  );

  // Priority 2: natural speech — "his name is X Y", "it's X Y", "this is X Y"
  const naturalName = !labelledName && (
    text.match(/(?:(?:his|her|their|my)\s+)?name\s+is\s+([A-Z][a-zÀ-ÿ'-]+(?:\s+[A-Z][a-zÀ-ÿ'-]+)+)/i) ||
    text.match(/(?:it's|it is|this is|called|known as|talking about)\s+([A-Z][a-zÀ-ÿ'-]+(?:\s+[A-Z][a-zÀ-ÿ'-]+)+)/i)
  );

  if (labelledName || naturalName) {
    const matched = (labelledName ?? naturalName)!;
    const parts = matched[1].trim().split(/\s+/);
    result.firstName = parts[0];
    result.lastName  = parts.slice(1).join(' ');
  } else {
    // Priority 3 fallback: first pair of consecutive Title Case words
    const anyName = text.match(/\b([A-Z][a-zÀ-ÿ'-]+)\s+([A-Z][a-zÀ-ÿ'-]+)\b/);
    if (anyName) {
      result.firstName = anyName[1];
      result.lastName  = anyName[2];
    }
  }

  /* — Connection type ------------------------------------------------------- */
  // Check from most specific to least to avoid false matches
  for (const [type, keywords] of Object.entries(CONNECTION_KEYWORDS) as [ConnectionType, string[]][]) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.connectionType = type;
      break;
    }
  }

  /* — Connection strength --------------------------------------------------- */
  for (const { words, value } of STRENGTH_KEYWORDS) {
    if (words.some(w => lower.includes(w))) {
      result.connectionStrength = value;
      break;
    }
  }

  /* — How we met ------------------------------------------------------------ */
  // Grab text after "met [at/through/via/during/in]" up to the next comma/period/end
  const metMatch = text.match(
    /(?:(?:we |i |first )?met(?:\s+(?:him|her|them))?\s+(?:at|through|via|during|in|at a|through a|over)?\s*)([^,.]+?)(?:\s*[,.]|$)/i,
  );
  if (metMatch && metMatch[1].trim().length > 3) {
    result.howWeMet = cap(metMatch[1].trim());
  }

  /* — Email ----------------------------------------------------------------- */
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  /* — Phone ----------------------------------------------------------------- */
  const phoneMatch = text.match(/(?:\+?\d[\d\s\-().]{7,}\d)/);
  if (phoneMatch) result.phone = phoneMatch[0].trim();

  /* — Lives in -------------------------------------------------------------- */
  const locationMatch = text.match(
    /(?:lives in|based in|located in|living in|from)\s+([A-Za-zÀ-ÿ\s,]+?)(?:\s*[,.]|$)/i,
  );
  if (locationMatch && locationMatch[1].trim().length > 2) {
    result.livesIn = titleCase(locationMatch[1].trim().replace(/,$/, ''));
  }

  return result;
}

/* ─── missing-field prompt ──────────────────────────────────────────────────── */

/**
 * Given the current (partial) form values, returns a natural-language hint for
 * the FIRST required field that is still empty, or null when all are filled.
 *
 * Priority: name → connection type → how we met → where they live (soft/optional)
 * connectionStrength is skipped — it defaults to 3, so it is always populated.
 */
export function getMissingFieldPrompt(values: Partial<ContactFormData>): string | null {
  if (!values.firstName || !values.lastName)
    return "What's their full name? Say their first and last name.";
  if (!values.connectionType)
    return "How do you know them? Say 'friend', 'colleague', 'mentor', etc.";
  if (!values.howWeMet)
    return "How did you meet? Say 'we met at…' or 'through…'";
  if (!values.livesIn)
    return "Where do they live? Say 'lives in…' or 'based in…'";
  return null;
}

/* ─── voice command detection ──────────────────────────────────────────────── */

/**
 * Returns true if the transcript contains a "create/save/add contact" command.
 * Used by the realtime voice flow to auto-submit the form.
 */
export function containsCreateCommand(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('create contact') ||
    lower.includes('save contact') ||
    lower.includes('add contact') ||
    lower.includes('submit contact')
  );
}
