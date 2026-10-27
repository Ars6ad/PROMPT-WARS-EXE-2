import { describe, expect, it } from 'vitest';
import { getLocalizedShiftBriefing, supportedLanguages } from './AccessibilityTools';

describe('voice accessibility settings', () => {
  it('offers a broad, unique set of voice-language choices', () => {
    const codes = supportedLanguages.map(language => language.code);

    expect(supportedLanguages.length).toBeGreaterThanOrEqual(30);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain('hi-IN');
    expect(codes).toContain('te-IN');
    expect(codes).toContain('ur-PK');
  });

  it('uses a localized shift briefing where one is available', () => {
    const englishFallback = 'Today is Tuesday.';

    expect(getLocalizedShiftBriefing('hi-IN', englishFallback)).toContain('आपकी शिफ्ट');
    expect(getLocalizedShiftBriefing('te-IN', englishFallback)).toContain('మీ షిఫ్ట్');
  });

  it('keeps the written fallback when a localized briefing is not yet provided', () => {
    expect(getLocalizedShiftBriefing('fr-FR', 'Today is Tuesday.')).toBe('Today is Tuesday.');
  });
});
