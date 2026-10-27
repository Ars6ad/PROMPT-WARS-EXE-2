import { describe, expect, it } from 'vitest';
import { createContentSecurityPolicy, privateRouteHeaders, securityHeaders } from './security';

describe('security headers', () => {
  it('creates a nonce-based CSP that locks the app to same-origin content and denies framing', () => {
    const contentSecurityPolicy = createContentSecurityPolicy('test-nonce');
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("form-action 'self'");
    expect(contentSecurityPolicy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(contentSecurityPolicy).toContain("script-src-attr 'none'");
    expect(contentSecurityPolicy).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  it('sets transport, cross-origin, clickjacking, MIME-sniffing, referrer, and permission controls', () => {
    const headers = Object.fromEntries(securityHeaders.map(header => [header.key, header.value]));
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(headers['Cross-Origin-Embedder-Policy']).toBe('require-corp');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Permissions-Policy']).toContain('microphone=()');
  });

  it('prevents sensitive workspace responses from being stored or indexed', () => {
    const headers = Object.fromEntries(privateRouteHeaders.map(header => [header.key, header.value]));
    expect(headers['Cache-Control']).toBe('no-store, max-age=0');
    expect(headers['X-Robots-Tag']).toContain('noindex');
  });
});
