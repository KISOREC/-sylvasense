# SylvaSense MVP architecture

## Status and scope

This document defines the proposed MVP integration architecture. The repository remains a scaffold: the only implemented API is liveness, the dashboard is a placeholder, and authentication, acquisition, processing, persistence models, alerting, investigations, and reports are not implemented. The local storage provider and role model below are designs, not implemented features. Nothing in this document claims operational coverage, model accuracy, or availability of authoritative Tamil Nadu forest boundaries.

The MVP supports the Forest Command Centre, division and monitoring-area selection, Google Maps, GEE Sentinel-1/Sentinel-2 analysis, preprocessing, candidate change detections and evidence, alert and investigation workflows, field observations, and PDF reports.

## System shape

```text
React + TypeScript dashboard (Google Maps; public restricted browser key)
                     │ HTTPS, session cookie, JSON / authorized asset stream
                     ▼
FastAPI (/api/v1) ── Pydantic contracts ── auth/RBAC and application services
       │                                             │
       │ SQLAlchemy / Alembic                        ├── Celery task submission
       ▼                                             ▼
PostgreSQL + PostGIS                           Redis broker/results
  users, scopes, workflow, metadata                   │
                                                      ▼
                                               worker orchestration
                                                │             │
                                           geospatial/     ai_models/
                                           GEE/Sentinel    versioned inference
                                                │             │
                                                └── storage provider interface
                                                          │
                                              local filesystem (MVP development)
                                              future object-storage adapter
```

The API owns authentication, authorization, request validation, persistence, workflow transitions, and orchestration. Celery workers execute long-running work and call independently testable `geospatial/` and `ai_models/` packages; these packages do not write operational alerts. PostGIS stores application entities and vector geometry. Large raster, image, attachment, and PDF contents live outside PostgreSQL through a replaceable storage-provider interface. PostgreSQL stores asset metadata and opaque provider keys only. Local development uses a configured filesystem root; a future cloud object-storage adapter must implement the same interface.

## MVP flow

1. A user signs in and selects a division and active monitoring area within their authorized division scope. Only sourced, reviewed official divisions can be approved for operational use. Demo boundaries are visibly labeled `DEMO` or `SYNTHETIC` and cannot be treated as operational divisions or observations.
2. The browser requests division, area, dashboard and map-overlay resources from the API and displays EPSG:4326 GeoJSON on Google Maps. The Maps key is public and referrer/API restricted; authentication, database, storage-root, and GEE secrets remain server-side.
3. The API validates an analysis request, snapshots the monitoring-area revision and input parameters, creates a queued job/attempt, and enqueues work. It returns `202` without waiting for analysis.
4. GIS queries GEE for real source products and persists acquisition states (`queried`, `selected`, `processed`, `excluded`), exclusion reasons, and immutable preprocessing provenance. It creates derived asset metadata and files through the storage interface.
5. AI consumes a versioned GIS analysis bundle and returns `DetectionResultV1` predictions with source lineage, dates, processing provenance, geometry, confidence, uncertainty, evidence and quality flags. Backend validates and persists the same contract; detections are candidate predictions, never field observations.
6. Authorized users create and manage alerts and investigations. Human decisions set severity and investigation conclusions; observations are append-only and distinct from predictions. Reports are generated from persisted records and provenance.

## Authentication and access model

The MVP uses email/password sign-in with passwords hashed using Argon2id (or a reviewed equivalent password-hashing algorithm with per-password salts and current recommended parameters). Plaintext passwords are never stored or logged. Public self-registration is disabled; administrators create/invite accounts and assign roles/scopes. Login establishes a server-validated opaque session in a `Secure`, `HttpOnly`, `SameSite` cookie; session identifiers are high-entropy, stored hashed server-side, rotated on login/privilege changes, expiring, revocable, and invalidated on logout. State-changing cookie-authenticated requests require CSRF protection and same-origin/allowlisted Origin checks. Enforce TLS outside local development. Password reset, lockout and recovery policies are deployment requirements before external exposure.

Roles are Administrator, Forest Officer, Investigator, and Viewer. Roles define allowed actions; a separate division-access relation scopes non-administrator users to one or more divisions. Every operational mutation uses the authenticated actor from the session, never a caller-supplied actor ID, and writes an audit event. Detailed grants are specified in `API_CONTRACTS.md` and `SECURITY.md`.

## Storage-provider design

The backend defines a provider interface for `put`, `open/read`, `delete` (restricted to retention/admin workflows), and existence/metadata checks. The local MVP provider stores bytes beneath a configurable absolute storage root outside the repository and PostgreSQL, using generated opaque keys (never user filenames or IDs as path components). It resolves and verifies every target stays beneath that root, writes through a temporary file followed by atomic rename, and records SHA-256, byte size, media type, creation time, and provenance in the `assets` table. The API never accepts or returns a filesystem path. Uploads stream with size limits, allowlisted/verified media types, filename sanitization for display only, and content validation where format permits. Retrieval is by UUID after authentication and object-level authorization; the service streams bytes or provides a short-lived authorized response, sets safe content disposition, and never serves an arbitrary path. See `SECURITY.md` and `DEPLOYMENT.md`.

The future object-storage provider implements the same interface and metadata contract, with private buckets, server-side credentials and short-lived authorized downloads. Switching provider is configuration/deployment work; public bucket access is prohibited.

## Boundary provenance model

Boundary origin is `official` or `demo`. Official records require an identifiable source authority and preserve source URI, version, source date, and license when available; missing optional fields are explicitly null/unknown, never invented. They begin `pending_review` and can become `approved` or `rejected` only through an audited reviewer decision. Only approved official boundaries are available for operational monitoring. Demo boundaries require `source_type` `demonstration` or `synthetic`, conspicuous labels in API/UI, and `demo_only` review/use status; they cannot be used to create operational analysis jobs or be presented as actual observations or official boundaries. No official boundary is fabricated or included by this design.

## Module ownership and integration

| Agent | Owned paths | Boundary |
|---|---|---|
| Lead architect/integration | `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_DICTIONARY.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md` | Own shared contracts and integration decisions; freeze shared interfaces before parallel implementation. |
| Frontend | `frontend/` | Command Centre, maps, session UX, API client; no server secrets or scientific source-of-truth logic. |
| Backend | `backend/`, `database/` | Auth/RBAC, Pydantic API, services, storage providers, orchestration, persistence and Alembic migrations; no duplicated GIS/AI algorithms. |
| GIS | `geospatial/` | GEE acquisition, Sentinel preprocessing, geometry/raster processing, quality checks and GIS-side `AnalysisBundleV1` production. |
| AI | `ai_models/` | Versioned inference/evaluation and `DetectionResultV1`; no field verification or alert decisions. |
| QA | `tests/` | Contract, integration, security, scientific-integrity and workflow coverage. |

Backend owns HTTP/database models. GIS and AI implement their sides of the frozen versioned contracts. Shared contract changes are coordinated by the lead; agents do not concurrently edit shared interfaces.

## Geospatial and scientific rules

- API GeoJSON uses RFC 7946 WGS 84 / EPSG:4326, `[longitude, latitude]`, with no nonstandard CRS member. API geometry is transformed to/from an explicitly declared internal PostGIS storage CRS at the boundary. Storage CRS may be EPSG:4326 for interchange geometry or an appropriate projected CRS for analysis; each column records its SRID. Never relabel coordinates without transformation.
- Preserve original source CRS, transformation operation/version, and geometry revision. Use a suitable projected or geodesic calculation for area/distance; never planar degrees.
- Record provider/source product ID, collection, acquisition timestamp, query/use state, and exclusion reason. Record preprocessing software/version, parameters, masks, source IDs, output asset IDs, CRS/resolution and checksums. Record detector name/version and uncertainty definition.
- Confidence and uncertainty are model properties. Severity is human-reviewed operational priority. Field verification is a separate observation/review. Satellite anomalies alone do not prove forest loss, cause, or illegality.
- GEE initialization is explicit, uses server credentials, and never occurs at import. Provider/configuration/coverage failures surface as failures, never fabricated success.

## Deployment and status

The existing FastAPI, SQLAlchemy, Alembic, PostgreSQL/PostGIS, Celery and Redis scaffold remains the base. Local filesystem asset storage is for MVP development; configure its root outside source control. Google Maps browser credentials are public and restricted. Deployment hardening and startup configuration are defined in `DEPLOYMENT.md`. All proposed endpoints, storage, authentication, tables and workflows are not implemented in the current scaffold.
