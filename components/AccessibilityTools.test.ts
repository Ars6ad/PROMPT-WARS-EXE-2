import { describe, expect, it } from 'vitest';
import { getCoreLabels, getLocalizedShiftBriefing, supportedLanguages } from './AccessibilityTools';

describe('voice accessibility settings', () => {
  it('offers a broad, unique set of voice-language choices', () => {
    const codes = supportedLanguages.map(language => language.code);

    expect(supportedLanguages.length).toBeGreaterThanOrEqual(30);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain('hi-IN');
    expect(codes).toContain('te-IN');
    expect(codes).toContain('ur-PK');
    expect(supportedLanguages.find(language => language.code === 'ur-PK')?.direction).toBe('rtl');
  });

  it('uses a localized shift briefing where one is available', () => {
    const englishFallback = 'Today is Tuesday.';

    expect(getLocalizedShiftBriefing('hi-IN', englishFallback)).toContain('आपकी शिफ्ट');
    expect(getLocalizedShiftBriefing('te-IN', englishFallback)).toContain('మీ షిఫ్ట్');
  });

  it('keeps the written fallback when a localized briefing is not yet provided', () => {
    expect(getLocalizedShiftBriefing('fr-FR', 'Today is Tuesday.')).toBe('Today is Tuesday.');
  });

  it('localizes high-frequency worker controls with an English fallback', () => {
    expect(getCoreLabels('hi-IN').checkIn).toBe('चेक इन');
    expect(getCoreLabels('te-IN').todaysShift).toBe('నేటి షిఫ్ట్');
    expect(getCoreLabels('ur-PK').voiceLanguage).toBe('سنانے کی زبان');
    expect(getCoreLabels('fr-FR').home).toBe('Home');
  });
});
