# Data dictionary and logical schema

## Scope and common conventions

This is the proposed logical MVP schema, not an implemented database schema. The scaffold has SQLAlchemy/Alembic setup but no operational ORM tables or migrations. Use reviewed Alembic migrations only. Use UUID primary keys, timezone-aware UTC timestamps, foreign keys, explicit delete behavior, and constraints/indexes for state and uniqueness. Keep audit/workflow histories append-only. PostgreSQL/PostGIS holds operational records and metadata; raster, image, attachment and PDF bytes live outside PostgreSQL via the storage-provider interface.

Prediction confidence, uncertainty, alert severity and field verification have distinct semantics and fields. No observation, official boundary, or accuracy value is fabricated. Synthetic/demo records are conspicuously labeled and separated from operational records.

## Logical entities

| Table | Fields and integrity semantics |
|---|---|
| `users` | `id`, unique normalized `email`, `password_hash` (Argon2id output only), `display_name`, `active`, `password_change_required`, created/updated UTC. Never store plaintext/reversible passwords. |
| `roles` / `user_roles` | Fixed role key `administrator`, `forest_officer`, `investigator`, `viewer`; user-role join with grantor and timestamp. Role changes are audited. |
| `user_division_access` | User/division grant, grantor, created/revoked UTC. Admin has global scope; other roles require explicit division scope. Enforce authorization in service queries, not UI alone. |
| `sessions` | `id`, user FK, unique token hash, created/last-seen/expiry/revoked UTC, safe client metadata. Never store raw cookie token. Logout revokes; expired/revoked sessions cannot authenticate. |
| `forest_divisions` | `id`, name/code, `origin` (`official`,`demo`), `source_type` (`government_authoritative`,`other_authoritative`,`demonstration`,`synthetic`), boundary geometry/SRID, source authority/URI/version/date/license, `review_status` (`pending_review`,`approved`,`rejected`,`demo_only`), reviewer/time/reason, operational eligibility, display label. Official requires identifiable authority and starts pending review; demo requires demo/synthetic type and remains demo_only. |
| `monitoring_areas` | `id`, optional division FK, name, geometry, origin (`official`,`user_drawn`,`user_imported`,`demo`), source type and provenance, review status, reviewer/time/reason, `active`, current geometry revision, computed area/method, creator/updater, timestamps. Demo cannot be used operationally; operational eligibility is derived from origin, review state and required provenance. |
| `monitoring_area_revisions` | Immutable `id`, area FK, monotonic revision, geometry/SRID, original CRS, transformation operation/version, source provenance snapshot, actor/time. Job stores the exact revision analyzed. |
| `analysis_jobs` | Logical job ID, area/revision, requester FK, status, requested/baseline dates, sensors, canonical allowlisted options/schema version, attempt count, created/updated times. Successful terminal status is `succeeded`; failed attempts and retryability are retained. |
| `analysis_job_attempts` | Job FK, sequence number unique per job, status, submitted/started/completed UTC, progress, Celery task ID, failure code/message/retryability, preprocessing/model versions and completion summary. Retry adds a new row; it does not erase prior failure. |
| `source_acquisitions` | Attempt FK, provider, collection, provider source product ID, sensor, acquired UTC timestamp, footprint geometry/source CRS, bands/resolution, state (`queried`,`selected`,`processed`,`excluded`), queried/selected/processed/excluded UTC timestamps, exclusion code/text, source asset/checksum, metadata. Excluded state requires reason; processed means used in processing. Unique product identity per attempt/provider/collection. |
| `preprocessing_runs` | Attempt FK, contract/version, software names/versions, canonical parameter JSON and schema version, ordered steps and parameters, input acquisition IDs, start/end UTC, quality flags. Immutable provenance for reproducibility. |
| `assets` | UUID, provider key opaque to API, provider name (`local_filesystem` for MVP or future adapter), media type, SHA-256, byte size, creation UTC, access classification, kind, provenance JSON, optional CRS/affine transform/resolution/bands/nodata. No absolute path or credential in API-visible metadata. |
| `derived_asset_sources` | Derived asset FK, source acquisition and/or derived asset FK, role, preprocessing run FK. Supports lineage DAG; prohibit cycles and preserve all immediate inputs. |
| `detections` | Job/attempt/area/revision references, candidate geometry, change class/vocabulary version, observed/baseline windows, area/method, confidence nullable [0,1], uncertainty and method/version, model/version, preprocessing run, prediction status, quality flags, timestamps. Origin/display label is derived from its monitoring area/job and returned explicitly; demo fixtures remain labeled. No severity or field-verification column. |
| `detection_sources` | Detection-to-acquisition join with role (`baseline`,`comparison`,`supporting`); every detection must reference acquisitions processed by its job. |
| `detection_evidence` | Detection FK, evidence kind, asset/acquisition references, media type/checksum/captured time/description. Assets retained outside DB. |
| `alerts` | ID, status, optional human-reviewed severity/setter/reason, assignee, title/notes, origin/display label, creator/timestamps. Severity is independent of confidence. |
| `alert_detections` | Alert/detection join plus `active_claim` and claim history. Partial unique constraint on `detection_id WHERE active_claim=true` prevents concurrent duplicate active alert claims. Transactionally clear claims when alert resolves/dismisses; later new alert may be created only after prior claim is terminal. |
| `alert_events` | Append-only actor FK, UTC time, prior/new status/severity, reason and assignment changes. |
| `investigations` | ID, alert FK, status, assignee, conclusion/notes, open/update/close UTC times, creator. Unique partial constraint permits at most one nonclosed investigation per alert; closed history remains. |
| `investigation_events` | Append-only actor, timestamp, old/new status, reason, conclusion changes. |
| `field_observations` | Investigation FK, authenticated actor FK, observer name, observed and recorded UTC times, type/finding, verification status, optional Point, notes, optional superseded observation FK. Immutable; corrections append. |
| `observation_evidence` | Observation-to-asset join with description and provenance. |
| `reports` | Investigation/requester FKs, state, template/version, created/completed UTC, snapshot/source record references, checksum, PDF asset FK, safe failure fields. |
| `audit_events` | Actor FK, action, target type/ID, request ID, UTC occurrence, safe change summary. Append-only, no cascading delete; never log password, cookie, secret, unnecessary personal data or unrestricted exact location. |

## Relationships and workflow integrity

```text
users * ── * roles (user_roles); users 1 ── * sessions
users * ── * forest_divisions (user_division_access)
forest_divisions 1 ── * monitoring_areas 1 ── * monitoring_area_revisions
monitoring_areas 1 ── * analysis_jobs 1 ── * analysis_job_attempts
analysis_job_attempts 1 ── * source_acquisitions 1 ── * preprocessing_runs
analysis_job_attempts 1 ── * detections * ── * source_acquisitions (detection_sources)
preprocessing_runs 1 ── * assets; assets * ── * sources (derived_asset_sources)
detections 1 ── * detection_evidence * ── 0..1 assets
alerts * ── * detections (alert_detections; one active claim per detection)
alerts 1 ── * alert_events; alerts 1 ── * investigations (max one open)
investigations 1 ── * investigation_events; investigations 1 ── * field_observations
field_observations * ── * assets (observation_evidence)
investigations 1 ── * reports * ── 0..1 assets
users 1 ── * audit_events; actor FKs on all workflow events
```

All foreign keys enforce division scope in service authorization. Use restrictive deletion for referenced scientific/workflow records; archive divisions/areas rather than deleting history. Detection lineage must agree with its attempt, acquisitions, preprocessing run, and assets. Failed provider queries are recorded as attempt failures, not synthetic acquisition rows. `queried -> selected -> processed` is the normal acquisition progression; `queried` or `selected` may instead become `excluded`. `excluded` requires a stable reason code and explanatory text. State timestamps and source IDs remain available for audit.

## Job, alert and investigation states

Jobs: `queued -> running -> succeeded|failed`; queued/running may become `cancelled`. A failed retryable job may receive a new attempt, leaving the logical job queued/running for that attempt while retaining prior failure details. `succeeded` explicitly means completed successfully, including valid runs with zero detections. Missing coverage/configuration/provider errors do not become zero-detection success.

Alert transitions and investigation transitions, including terminal/reopen behavior, are normative in `API_CONTRACTS.md`. Database events are append-only and each transition stores actor, time, prior/next state and required reason. Duplicate active detection alerts and multiple active investigations per alert are constrained as above.

## Boundary provenance and demo separation

Division and area records carry `origin`, `source_type`, `source_authority`, `source_uri`, `source_version`, `source_date`, `license`, review status and display label. Official boundary rows require identifiable authority and are not operational until approved after review. Demo/synthetic rows are immutable as demo class, clearly labeled, excluded from operational jobs/counts by default and cannot be promoted to official. Never fabricate official Tamil Nadu forest boundaries or observations.

## Spatial, temporal and asset rules

- API GeoJSON is RFC 7946 EPSG:4326 `[longitude, latitude]`. Internal PostGIS geometry columns declare SRID individually. Incoming geometry is transformed into the configured storage/analysis CRS; output is transformed back to EPSG:4326. Preserve source CRS and transformation operation/version. Do not assign a new SRID without transforming coordinates.
- Use suitable projected or geodesic computations for area/distance and record method/CRS. Never compute hectares from square degrees.
- Acquisition and observation times preserve source meaning and are timezone-aware UTC. API date windows are inclusive UTC calendar dates. Record imagery product ID and acquisition date/time, preprocessing parameters/software, model version and derived asset lineage.
- Raster assets retain CRS, affine transform, resolution, nodata, bands, datatype/units where known, checksum and lineage. Asset bytes are outside PostgreSQL; metadata and opaque provider keys are inside it. Local path resolution is private to the storage adapter and never API input/output.

## Migration and seed policy

Alembic is the only schema-change mechanism. Review migrations for PostGIS, indexes, foreign keys, uniqueness/partial indexes and downgrade behavior. Synthetic fixtures must be labeled and isolated; no invented official boundaries, satellite observations, model accuracy or real alerts are seeded.
