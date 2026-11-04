# Deployment and local development

This is deployment guidance for the proposed MVP. The repository is a scaffold; the operational API, authentication, assets, GIS/AI jobs, and schema described here are not implemented. The existing Compose stack is for local development, not production.

## Local development configuration

1. Copy `.env.example` to ignored `.env` and replace all local placeholder passwords. Never commit `.env`, credentials, or service-account JSON.
2. Configure PostgreSQL/PostGIS, Redis/Celery, API settings, and Earth Engine only as needed. Earth Engine credentials/project stay server-side and outside the repository.
3. Configure an absolute filesystem asset root outside the repository and outside the web root (for example a user-specific application data directory). The backend process must have read/write access only to that root. The root is deployment configuration, not a client-provided path. Keep it in ignored local configuration; do not add credentials or host-specific paths to source control.
4. Configure Google Maps browser key only as a public `VITE_*` setting, restricted by local/deployed referrer and required APIs. No backend secret belongs in frontend variables.
5. Start services using the documented Compose workflow. Review and apply Alembic migrations explicitly; startup must not silently mutate database schema.

Storage interface contract supports local filesystem MVP and future private cloud object storage. Both providers must persist the same asset metadata and authorized UUID-based retrieval behavior. Filesystem root must be backed up consistently with PostgreSQL metadata; restore procedures verify checksums and references.

## Application topology

Deploy frontend and HTTPS FastAPI behind a TLS-terminating reverse proxy or same-origin gateway. Keep PostgreSQL, Redis, filesystem asset root, Celery workers and GEE credentials on private service/network boundaries. Only the API serves authorized asset content; never mount the storage root as a static web directory. Workers use least-privilege service identity and the shared storage interface. Object-storage migration later replaces provider configuration/adapter, not public API paths or asset UUIDs.

## Authentication and session settings

Use administrator-provisioned accounts and reviewed Argon2id password hashing. Set secure cookie flags, session lifetime/rotation/revocation, CSRF protections and explicit Origin/CORS allowlists for the actual deployment hostname. TLS is required outside isolated local development. Configure rate limits and recovery/lockout policies before operational use. Provision initial administrator securely out of band; do not seed a default password or commit credentials. Assign division scopes explicitly and verify role/scope access with deployment smoke procedures.

## Filesystem and upload settings

Set `ASSET_STORAGE_PROVIDER=local_filesystem` and `ASSET_STORAGE_ROOT` (names proposed; implementation must add validated configuration). Root must be absolute, writable by API/worker identities that need it, inaccessible to untrusted users, outside repository and served directories, and backed up. Configure max upload bytes per asset kind, media allowlists, proxy request limits and safe timeouts consistently. Do not accept root/key/path from request data. Ensure filesystem quotas, free-space monitoring, backup, restore, retention and integrity-check procedures exist. Failed uploads clean temporary files; reconciliation detects orphan files/metadata.

## Production hardening checklist

- Use managed secret storage for database, session-signing/session-encryption (if applicable), GEE, and future object-store credentials. Rotate credentials and limit service permissions.
- Use non-default credentials, private database/cache networks, TLS, firewall restrictions, request size/rate limits, CORS allowlist, security headers and dependency update process.
- Run migrations as a reviewed release step with backup and rollback plan; do not use ad hoc SQL or schema autogeneration at runtime.
- Back up PostgreSQL and asset bytes with coordinated consistency; test restore and checksum validation. Document retention and audited deletion.
- Monitor API, workers, queue age, provider errors, local disk capacity, storage failures, session/auth events and job failure rates without logging sensitive payloads.
- Restrict access to exact field locations and sensitive reports. Reports/downloads use authenticated authorization and short-lived access where applicable.
- Obtain and document official boundary source authority, version, date, license and review before operational enablement. Demo data remains visibly labeled and excluded from operational counts/jobs.
- Keep operational reports clear that candidate satellite anomalies are not proof of illegal deforestation; retain product, acquisition, preprocessing and model provenance.

## Unresolved deployment decisions

Choose deployment host/origin and TLS termination, session lifetime and recovery policies, upload size limits per kind, filesystem backup/retention targets, malware scanning capability, and the future object-storage vendor/region/retention policy before production launch. These choices do not change the UUID-based API asset contract.
