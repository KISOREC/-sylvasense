# Security architecture and guidance

This document defines proposed MVP controls; authentication and storage features are not implemented in the current scaffold.

## Authentication and passwords

- Use email/password accounts provisioned by administrators; disable public self-registration.
- Hash passwords with Argon2id using a maintained library and reviewed current parameters. Per-password salts are handled by the password-hashing library. Never store plaintext or reversibly encrypted passwords, and never log passwords or hashes.
- Use generic login failure messages, rate-limit attempts, and define lockout/recovery/password-reset policy before external exposure. Reset tokens, if added, are random, single-use, short-lived, hashed at rest, and never logged.
- Login issues a high-entropy opaque session cookie with `Secure`, `HttpOnly`, `SameSite=Strict` (or documented deployment-compatible mode), narrow path/domain and bounded expiry. Store only a token hash server-side. Rotate on login/privilege change; revoke on logout, account disablement, or expiry. Use TLS outside local development.
- Cookie-authenticated mutations require CSRF defense (synchronizer token or equivalent) and Origin/Referer validation. Use same-origin hosting where practical; CORS is explicit allowlist only.
- Do not store authentication or GEE secrets in source, frontend `VITE_*` variables, logs, fixtures, or browser storage. Maps browser keys are public and must be restricted by referrer and allowed APIs.

## Authorization and audit

Roles: Administrator, Forest Officer, Investigator, Viewer. Division access is a separate explicit grant; authorization must be enforced server-side for every read, write, map feature, asset, and report. Administrator has global scope and provisions accounts/grants. Other users only access assigned divisions. Forest Officers manage operational work in assigned divisions; Investigators manage assigned investigations and observations; Viewers have read-only access. Use least privilege and deny by default. Derive actor ID from authenticated session, never request body. Record actor/time/reason for every operational state transition and scope/grant change in append-only audit history. Avoid exposing exact field locations beyond authorized users.

## Local filesystem asset storage

- MVP development storage uses a configurable absolute root outside the repository and web root. Keep path/root configuration in ignored local environment configuration or managed deployment configuration; do not commit secrets or machine-specific paths. Do not put credentials in configuration values.
- Store bytes outside PostgreSQL; store UUID asset ID, opaque provider key, media type, SHA-256, size, creation time, access class and provenance in PostgreSQL. Never expose local absolute paths or accept filesystem paths/keys from API callers.
- Generate storage keys server-side from random/UUID material. Sanitize display filenames; never use caller filenames as path segments. Resolve canonical paths and verify containment beneath configured root to prevent traversal and symlink escape. Use atomic temporary writes and cleanup partial uploads.
- Enforce per-kind size limits before and during streaming. Allowlist expected media types and validate file signatures/structure where practical; do not trust client MIME type or extension. Reject unsupported content with 415 and oversized uploads with 413. Scan uploads when deployment capability exists; keep untrusted files non-executable and outside served static directories.
- Retrieve assets only by UUID after authentication and object/division authorization. Stream with safe content type/disposition and `X-Content-Type-Options: nosniff`; do not provide arbitrary path access. Future object storage must use private buckets, server-side credentials and short-lived authorized access.
- Define backup, retention and deletion procedures for local assets and reconcile metadata/files after failures. Do not delete evidence while referenced by a report or case without an audited retention action.

## Boundaries and scientific data integrity

- Official forest boundaries require identifiable source authority and preserve URI, version, date and license where available; require review before operational use. Never fabricate official Tamil Nadu boundaries.
- Demo/synthetic boundaries and fixtures must be conspicuously labeled `DEMO` or `SYNTHETIC`, excluded from operational workflows by default, and never represented as official or real observations.
- Preserve satellite source product IDs, acquisition timestamps, processing parameters/software, model version and asset lineage. Predictions, confidence, uncertainty, operational severity and field verification are separate. Satellite anomalies alone are not proof of illegal deforestation.

## Operational controls

Before public/operational deployment, configure TLS, restricted network access, secure CORS, rate limits, dependency patching, database least privilege, encrypted backups and restore tests, monitoring/alerting, incident response, audit retention and account recovery controls. Restrict GEE service-account permissions. Do not log passwords, cookies, CSRF tokens, secrets, unnecessary personal information, or unrestricted precise locations. Report suspected vulnerabilities privately to maintainers.
