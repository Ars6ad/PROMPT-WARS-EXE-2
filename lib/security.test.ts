import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, securityHeaders } from './security';

describe('security headers', () => {
  it('locks the app to same-origin content and denies framing', () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("form-action 'self'");
  });

  it('sets clickjacking, MIME-sniffing, referrer, and permission controls', () => {
    const headers = Object.fromEntries(securityHeaders.map(header => [header.key, header.value]));
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Permissions-Policy']).toContain('microphone=()');
  });
});
