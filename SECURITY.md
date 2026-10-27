# Security policy

## Scope

FairShift is a hackathon prototype. It uses synthetic data and browser-local demo state only. It must not be used to collect, store, or make decisions from real worker, payroll, health, safety, identity, or biometric data.

The project has browser protections such as a nonce-based Content Security Policy, restrictive response headers, schema validation, and privacy-aware demo rendering. These controls reduce browser-side risk; they do not turn the current client-only role selector into a production identity or authorisation system.

## Reporting a vulnerability

Please do **not** open a public issue for a suspected security vulnerability.

1. Use GitHub's private vulnerability reporting flow for this repository if it is enabled.
2. If it is not available, contact the repository maintainer through an agreed private channel.
3. Include the affected route or file, reproduction steps, impact, and a safe proof of concept. Do not include real personal data, credentials, tokens, or safety reports.

The maintainer should acknowledge a report, assess its scope, and agree on a coordinated disclosure timeline before publishing details.

## Supported version

Only the latest commit on `main` is supported. The application is updated through the lockfile, automated dependency checks, and weekly Dependabot monitoring.

## Production deployment requirements

Before FairShift handles real data, its operator must provide server-enforced authentication and role-based access control, tenant isolation, HTTP-only secure session cookies, CSRF protection, rate limits, encrypted persistent storage, secret management, observability, backup and retention controls, and an incident-response process. A security review and threat model should be completed before launch.
