import { describe, expect, it } from 'vitest';
import {
  CONTACT_SHEET_DELETE_BUTTON_CLASS,
  isContactVoiceInputEnabled,
} from './contactSheetPresentation';

describe('contact sheet presentation', () => {
  it('defaults contact voice input on and respects disabled profiles', () => {
    expect(isContactVoiceInputEnabled(undefined)).toBe(true);
    expect(isContactVoiceInputEnabled({ contactVoiceInputEnabled: true })).toBe(true);
    expect(isContactVoiceInputEnabled({ contactVoiceInputEnabled: false })).toBe(false);
  });

  it('keeps edit-mode delete styling discreet until the confirmation modal', () => {
    expect(CONTACT_SHEET_DELETE_BUTTON_CLASS).toContain('text-muted-foreground');
    expect(CONTACT_SHEET_DELETE_BUTTON_CLASS).not.toContain('destructive');
    expect(CONTACT_SHEET_DELETE_BUTTON_CLASS).not.toContain('red');
  });
});
