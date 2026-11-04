# API contracts (MVP)

## Status and conventions

These are proposed implementation contracts. The scaffold currently exposes only `GET /api/v1/health`; no operational endpoint or authentication flow below is implemented. API prefix is `/api/v1`. JSON successes use `{"data": ..., "message": null, "request_id": "..."}`; `message` and `request_id` may be null. JSON errors use `{ "error": {"code": str, "message": str, "details": [{"field": str|null, "issue": str}]}, "request_id": str|null }`. Lists return `{items: [...], page: int, page_size: int, total: int}`. Page defaults to 1, page size 50, maximum 200. UUIDs are used for internal IDs. All timestamps are ISO 8601 UTC (`Z`).

HTTP errors: 400 domain-invalid request, 401 unauthenticated, 403 forbidden, 404 missing resource, 409 state/uniqueness conflict, 413 upload too large, 415 unsupported media type, 422 schema validation, 429 rate limit, 500 unexpected internal error, 502 upstream provider failure, 503 unavailable dependency. Normalize framework errors to the error envelope; never expose stack traces, filesystem paths, provider details, tokens, or secrets. Include request IDs in responses/logs. Async failures remain readable resources with stable safe failure code/message and retryability.

Generic schema: `Page[T] = {items: list[T], page: int >= 1, page_size: int 1..200, total: int >= 0}`. Health is the only implemented endpoint: `GET /health -> 200 ApiResponse[HealthRead]`, where `HealthRead = {status: Literal["ok"]}`. It is liveness only.

## Authentication, sessions and role access

Email/password accounts are provisioned by an Administrator; public registration is disabled. Request/response bodies:

```text
POST /auth/login request LoginRequest {email: EmailStr, password: str}
  -> 200 LoginResponse {user: UserRead, expires_at: datetime}; sets opaque session cookie
POST /auth/logout request: no body, requires CSRF header -> 204; revokes current session and clears cookie
GET /auth/me request: cookie -> 200 UserRead
GET /auth/csrf request: session cookie -> 200 {csrf_token: str}
POST /admin/users request AdminUserCreate {email: EmailStr, display_name: str, temporary_password: str, roles: list[Role], division_ids: list[UUID]}
  -> 201 UserRead (temporary password is immediately hashed and never returned)
PATCH /admin/users/{user_id} request AdminUserUpdate {active: bool|null, roles: list[Role]|null, division_ids: list[UUID]|null}
  -> 200 UserRead
POST /auth/password/change request PasswordChangeRequest {current_password: str, new_password: str}
  -> 204; clears password_change_required
```

Cookie is Secure, HttpOnly, SameSite=Strict (or a documented compatible deployment mode), scoped narrowly to the API, and contains only an opaque high-entropy session token; server stores a hash of that token with expiry/revocation. Rotate on login and privilege change. Cookie-authenticated state-changing requests require the token from `/auth/csrf` in `X-CSRF-Token` and Origin checks. Rotate CSRF token with session rotation. Passwords are hashed with Argon2id (reviewed equivalent only by security review); no plaintext or reversible password storage. Login responses never return password hashes or session token in JSON. `204` logout has no response body and is the explicit success-envelope exception.

`UserRead`: `{id: UUID, email: EmailStr, display_name: str, active: bool, password_change_required: bool, roles: list[Role], division_ids: list[UUID]}`. `Role = Literal["administrator", "forest_officer", "investigator", "viewer"]`. Division scopes are separate from role grants. Administrator has global administrative and operational access. Forest Officer reads assigned division maps/data and can create analysis jobs, triage/manage alerts, assign investigations and record operational decisions for assigned divisions. Investigator reads assigned divisions and linked alerts, manages assigned investigations, adds field observations/evidence and requests reports. Viewer has read-only dashboard/map/job/detection/alert/report access only within assigned divisions. User provisioning, role grants, and division scope changes are administrator-only, audited actions; implement through admin-managed user endpoints or deployment provisioning, never self-registration. All mutation actors are derived from the authenticated session, not request fields. Temporary passwords require change on first login; password change rotates session and CSRF token.

| Role | Allowed operations (within division scope except Administrator) |
|---|---|
| Administrator | User/role/scope administration, division import/review, all operational reads/writes and audit access. |
| Forest Officer | Dashboard/map reads, create jobs/alerts, alert transitions/severity/assignment, monitoring-area review, investigation assignment and operational decisions. Cannot administer accounts or approve official division boundaries. |
| Investigator | Read assigned division data/alerts, manage assigned investigations, add observations/evidence, request/read reports. Cannot set boundary approval or admin roles. |
| Viewer | Read-only dashboard, maps, jobs, detections, alerts, investigations/reports and authorized evidence metadata/content. |

Do not allow disabling/removing the last active Administrator. Temporary-password delivery and forced change/reset are deployment policy decisions; never return temporary password in API response or logs.

## Dashboard and map endpoints

Every endpoint enforces division scope. A demo boundary/detection is returned only with `include_demo=true` and is explicitly marked; demo records do not count as operational observations. Dates in filters are UTC calendar dates.

### `GET /dashboard/summary?division_id=&from=&to=&include_demo=`

Response `DashboardSummary`:

```text
DashboardSummary:
  generated_at: datetime
  period: {from: date | None, to: date | None}
  division_id: UUID | None
  counts: {accessible_divisions: int, active_monitoring_areas: int,
           jobs: {queued: int, running: int, succeeded: int, failed: int, cancelled: int},
           detections: int, alerts: {new: int, triaged: int, investigating: int,
                                     resolved: int, dismissed: int},
           alerts_by_severity: {unreviewed: int, low: int, medium: int, high: int, critical: int}}
  recent_jobs: list[AnalysisJobSummary] (max 10)
  recent_alerts: list[AlertSummary] (max 10)
  demo_counts: {divisions: int, active_monitoring_areas: int, jobs_by_state: object,
                detections: int, alerts_by_state: object} | None
    (only if include_demo=true; separately labeled and excluded from operational counts)

AnalysisJobSummary:
  id: UUID
  monitoring_area_id: UUID
  status: queued|running|succeeded|failed|cancelled
  submitted_at: datetime
  progress_percent: int | None
  display_label: str

AlertSummary:
  id: UUID
  status: new|triaged|investigating|resolved|dismissed
  severity: low|medium|high|critical|None
  detection_count: int
  updated_at: datetime
  display_label: str
```

### `GET /divisions?page=&page_size=&include_demo=false`

Response `Page[DivisionRead]`. `DivisionRead` is `{id, name, code: str|null, boundary: GeoJSON MultiPolygon|Polygon|null, origin: official|demo, source_type: government_authoritative|other_authoritative|demonstration|synthetic, source_authority: str|null, source_uri: str|null, source_version: str|null, source_date: date|null, license: str|null, review_status: pending_review|approved|rejected|demo_only, operationally_eligible: bool, display_label: str, created_at, updated_at}`. List returns geometry by default for map use; optional `include_geometry=false` may omit it. Demo label is exactly prefixed `DEMO` or `SYNTHETIC`; demo never has `operationally_eligible=true`. Official geometry is eligible only when provenance has an identifiable authority and review status is `approved`. Demo rows are omitted unless `include_demo=true`.

### `GET /divisions/{division_id}`

Response `DivisionRead` including geometry when available. Missing/unreviewed geometry is represented as null plus its availability/review state; no fallback geometry is synthesized.

### `GET /monitoring-areas?division_id=&active=&origin=&review_status=&include_demo=false&page=&page_size=`

Response `Page[MonitoringAreaRead]`; geometry included by default for map use, optionally omitted. `MonitoringAreaRead` is `{id, name, division_id: UUID|null, geometry: GeoJSON Polygon|MultiPolygon, area_hectares: Decimal, origin: official|user_drawn|user_imported|demo, source_type: government_authoritative|other_authoritative|user_supplied|demonstration|synthetic, source_authority/source_uri/source_version: str|null, source_date: date|null, license: str|null, review_status: pending_review|approved|rejected|demo_only, operationally_eligible: bool, display_label: str, active: bool, geometry_revision: int, created_at, updated_at}`. Demo areas are `demo_only`, labeled, and excluded from operational selection/jobs.

### Map overlays

`GET /map/detections?division_id=&monitoring_area_id=&from=&to=&prediction_status=&include_demo=false&bbox=&page=&page_size=` returns `Page[DetectionMapFeature]` with GeoJSON feature geometry and properties `{detection_id, analysis_job_id, division_id, monitoring_area_id, change_class, observed_window, baseline_window, confidence, uncertainty, model_name, model_version, severity: null, field_verification_status: unverified|supports_change|does_not_support_change|inconclusive, origin: official|demo, display_label, created_at}`. Verification is derived from linked observations, never from model output. `bbox` is `west,south,east,north` EPSG:4326 and access-scoped. This is map-ready output and must not style severity from confidence.

`GET /map/alerts?division_id=&monitoring_area_id=&status=&severity=&include_demo=&bbox=&page=&page_size=` returns `Page[AlertMapFeature]`; each feature uses linked detection geometry and properties `{alert_id, detection_ids, status, severity, division_id, monitoring_area_id, display_label, created_at}`. Alerts with multiple detections may return multiple features carrying one alert ID. No geometry is invented for an alert without detection geometry.

Map endpoint page envelope includes GeoJSON Feature objects, all in EPSG:4326. A future bbox-clipped tile/vector endpoint must be separately versioned; Google Maps base tiles are not satellite analytical evidence.

## Boundary and monitoring-area mutations

`POST /monitoring-areas` request `MonitoringAreaCreate`: `{name, division_id: UUID|null, geometry: GeoJSON Polygon|MultiPolygon, origin: official|user_drawn|user_imported|demo, source_type, source_authority, source_uri, source_version, source_date, license, notes}`. Review status and operational eligibility are server-controlled and are not accepted in create/update requests. Official imported geometry requires authority and starts pending review. Demo requires demonstration/synthetic source type and is fixed to `demo_only`. Returns `201 MonitoringAreaRead`.

`GET /monitoring-areas/{area_id}` returns `MonitoringAreaRead`.

`POST /monitoring-areas/{area_id}/review` is Administrator-only or Forest Officer with scope for the area's division. Request `{decision: approved|rejected, reason: str}`. Returns updated `MonitoringAreaRead`; an official area requires identifiable authority before approval, a user-drawn/imported area requires source type `user_supplied` and scoped review, and demo data cannot be approved. Division-boundary approval is Administrator-only through `/divisions/{division_id}/review`.

`PATCH /monitoring-areas/{area_id}` request `MonitoringAreaUpdate` permits `{name?, geometry?, active?, notes?}` only; changes are audited, geometry changes create immutable revisions and recompute area. Source provenance and origin are immutable; source correction uses an audited review/import workflow. Returns updated `MonitoringAreaRead`.

Division import/review is administrator-only and sourced; no public creation endpoint accepts an official designation without provenance. Review endpoint `POST /divisions/{division_id}/review` request `{decision: approved|rejected, reason: str}` records actor/time. A demo division cannot be approved as official.

## Jobs and acquisition

`POST /analysis-jobs` request `AnalysisJobCreate`: `{monitoring_area_id: UUID, start_date: date, end_date: date, sensors: list[sentinel-1|sentinel-2], baseline_start_date: date|null, baseline_end_date: date|null, processing_options: versioned allowlisted object}`. Dates are inclusive UTC calendar dates; end must be >= start. Baseline dates must be both absent or both present; if present end >= start and baseline window must not overlap requested window. With no baseline, the selected detector must document support for within-window change analysis; otherwise validation rejects request. Demo-only or unapproved areas are rejected. Actor is session-derived. Returns `202 JobRead` with `Location` status URL and attempt 1.

`AnalysisJobRead`: `{id, monitoring_area_id, area_revision, status: queued|running|succeeded|failed|cancelled, attempt_count, attempts: AnalysisAttemptRead[], submitted_at, started_at|null, completed_at|null, progress_percent:int|null, requested_window, baseline_window|null, sensors, processing_options, acquisitions: list<SourceAcquisitionRead>, detection_ids, failure_code|null, failure_message|null, retryable: bool, processing_version|null}`. `AnalysisAttemptRead` is `{attempt_number, status: queued|running|succeeded|failed|cancelled, submitted_at, started_at|null, completed_at|null, progress_percent:int|null, acquisitions: SourceAcquisitionRead[], detection_ids: UUID[], failure_code|null, failure_message|null, retryable: bool, processing_version|null}`; attempts are ordered oldest first and preserve prior failure details. Job-level acquisitions/detections summarize the latest attempt; attempt detail includes that attempt's acquisitions/detections. `succeeded` means processing completed successfully; it may have zero detections if successful analysis had valid coverage and yielded none. No coverage/configuration/processing failure is represented as successful zero detections. A reportable successful run records actual product coverage and a completion summary.

`POST /analysis-jobs/{job_id}/retries` has no body and is allowed only for a failed, retryable job; it creates a new immutable attempt under the logical job, increments attempt count, and returns `202 JobRead`. Retry limit/backoff are deployment settings. Prior attempt errors/provenance remain available. `POST /analysis-jobs/{job_id}/cancel` requests cancellation for queued/running jobs; response `202 JobRead`; terminal jobs cannot be cancelled. Job state is authoritative, Celery state is operational detail.

`SourceAcquisitionRead`: `{id, provider, collection, source_asset_id, sensor, acquired_at: datetime, footprint: GeoJSON|null, source_crs, bands, native_resolution_m, state: queried|selected|processed|excluded, state_timestamps: {queried_at: datetime, selected_at: datetime|null, processed_at: datetime|null, excluded_at: datetime|null}, exclusion_reason: {code: str, message: str}|null, asset_ids: UUID[], checksum: str|null}`. Every returned catalog product begins `queried`; `selected` means preprocessing input accepted; `processed` means actually contributed to successful processing; `excluded` requires a stable reason code and explanatory text (e.g. `cloud_or_quality`, `incomplete_coverage`, `unsupported_product`, `duplicate`, `processing_invalid`, `outside_effective_coverage`). Failed provider queries are job failures, not fabricated acquisition rows. Preserve provider product ID and acquisition timestamp.

## Versioned GIS-to-AI-to-backend contract

One JSON-compatible Pydantic contract, `AnalysisBundleV1`, is the versioned handoff. GIS produces source and derived-product provenance; AI consumes the bundle and returns `DetectionResultV1` entries; backend validates/persists both without changing scientific values. `contract_version` is exactly `1.0`. Breaking changes require a new major version and coordinated adapter rollout.

```text
AnalysisBundleV1:
  contract_version: Literal["1.0"]
  job_id: UUID
  monitoring_area_id: UUID
  area_revision: int
  requested_window: {start_date: date, end_date: date}
  baseline_window: {start_date: date, end_date: date} | None
  acquisitions: list[AcquisitionV1]
  preprocessing: PreprocessingRunV1
  derived_assets: list[DerivedAssetV1]

AcquisitionV1:
  acquisition_id: UUID
  provider, collection, source_asset_id, sensor: str
  acquired_at: datetime (UTC)
  source_footprint: GeoJSON | None (API/output geometry EPSG:4326)
  source_crs: str
  bands: list[str]
  native_resolution_m: float | None
  state: queried|selected|processed|excluded
  state_timestamps: {queried_at: datetime, selected_at: datetime|null,
                     processed_at: datetime|null, excluded_at: datetime|null}
  exclusion_reason: {code: str, message: str} | None (required iff excluded)
  asset_id: UUID | None
  checksum: str | None

PreprocessingRunV1:
  version: str
  software: list[{name: str, version: str}]
  parameters: object (canonical JSON, schema/version recorded)
  steps: list[{name: str, version: str, parameters: object}]
  source_acquisition_ids: list[UUID]
  started_at: datetime (UTC)
  completed_at: datetime | None (UTC; null only while running or after failed step)
  quality_flags: list[str]

DerivedAssetV1:
  asset_id: UUID
  role: str (e.g. baseline_composite, comparison_composite, index, mask, thumbnail)
  media_type: str
  checksum: str (SHA-256)
  size_bytes: int
  crs: str
  transform: list[float] | None
  resolution: list[float] | None
  bands: list[str]
  nodata: float | None
  source_acquisition_ids: list[UUID]
  preprocessing_run_version: str

DetectionResultV1:
  contract_version: Literal["1.0"]
  candidate_id: UUID
  monitoring_area_id: UUID
  area_revision: int
  geometry: GeoJSON Polygon|MultiPolygon (EPSG:4326)
  change_class: str
  observed_window: {start_date: date, end_date: date}
  baseline_window: {start_date: date, end_date: date} | None
  estimated_area_hectares: Decimal | None
  confidence: float | None (0..1; model-defined)
  uncertainty: object | None (model-defined distribution/value plus method/version)
  model_name, model_version: str
  preprocessing_run_version: str
  source_acquisition_ids: list[UUID]
  evidence: list[{kind: str, asset_id: UUID, source_acquisition_ids: list[UUID],
                 media_type: str, checksum: str, captured_at: datetime|null, description: str}]
  quality_flags: list[str]
  prediction_status: Literal["candidate"]
```

Backend adds `analysis_job_id`, persistence timestamps and review state when creating `DetectionRead`; it validates all source/asset IDs belong to the job, records checksums and lineage, and never accepts GIS/AI severity or field-verification fields. GIS/AI outputs cannot assert verification or operational severity. A missing, invalid, or unsupported contract version fails the job explicitly.

Backend maps `candidate_id` to the persisted detection's idempotency key: a repeated candidate ID within the same job/attempt is an idempotent replay, while reuse with different content is a contract conflict. The public `DetectionRead.id` is the backend UUID; it may equal `candidate_id` if the implementation chooses that stable mapping, otherwise the mapping is persisted.

`GET /analysis-jobs/{job_id}` returns `JobRead`; `GET /detections` and `/detections/{detection_id}` return the persisted `DetectionRead` below. Detection listing filters: `division_id`, `monitoring_area_id`, `analysis_job_id`, `from`, `to`, `prediction_status`, `change_class`, `include_demo`, `bbox`, `page`, `page_size`. `DetectionRead` extends `DetectionResultV1` with `id`, `analysis_job_id`, `created_at`, and `origin/display_label`; it has no severity or verification assertion (API may include `verification_status` only as a derived field from linked observations, clearly identified as such).

## Detection and evidence schemas

`GET /detections` returns `Page[DetectionRead]`; `GET /detections/{detection_id}` returns `DetectionRead`. `GET /detections/{detection_id}/evidence` returns `Page[EvidenceRead]`.

`EvidenceRead`: `{id: UUID, kind, asset_id: UUID, source_acquisition_ids: UUID[], media_type, checksum: SHA-256, captured_at: datetime|null, description, created_at}`. Evidence is metadata; bytes are retrieved through authorized asset routes, never inline filesystem paths.

## Alerts and investigations

`POST /alerts` request `AlertCreate {detection_ids: list[UUID] (nonempty), title: str|null, note: str|null}`; detection IDs must be accessible and all from the same origin class (operational or demo). Demo alerts are labeled and excluded from operational summaries. One active alert claim per detection is enforced transactionally; duplicate active claims return `409`. Returns `201 AlertRead`.

`GET /alerts?division_id=&detection_id=&status=&severity=&include_demo=false&page=&page_size=` returns `Page[AlertRead]`. `GET /alerts/{alert_id}` returns `AlertRead`. `AlertRead` includes `{id, status, severity|null, severity_set_by: UUID|null, severity_reason: str|null, detection_ids, assigned_to: UUID|null, origin: official|demo, display_label, created_at, updated_at, history: AlertEvent[]}`. `PATCH /alerts/{alert_id}` body `AlertUpdate {status: next allowed status|null, severity: low|medium|high|critical|null, reason: str|null, assigned_to: UUID|null}`. Actor/time are server-derived. Reason is required for dismissal, resolution, reopening, and severity changes. Severity is human-reviewed and never mapped from confidence.

Alert transitions: `new -> triaged|dismissed`; `triaged -> investigating|dismissed`; `investigating -> resolved|dismissed|triaged`; `resolved -> triaged` only with audited reopen reason; `dismissed` terminal. `AlertEvent` contains actor ID, timestamp, old/new status/severity, reason and assignment change. Any transition creates an append-only event.

`POST /alerts/{alert_id}/investigations` body `InvestigationCreate {assigned_to: UUID|null, notes: str|null}` returns `201 InvestigationRead`; only for a triaged alert and only one nonclosed investigation per alert is allowed, uniqueness enforced transactionally. `GET /alerts/{alert_id}/investigations` returns `Page[InvestigationRead]`. `GET /investigations/{id}` returns `InvestigationRead`; `PATCH /investigations/{id}` accepts `InvestigationUpdate {status: next status|null, assigned_to: UUID|null, conclusion: unresolved|change_confirmed|no_change|other|null, conclusion_notes: str|null}` and returns updated read model. `InvestigationRead` includes id, alert_id, status, assignment, opened/updated/closed UTC times, conclusion and notes.

| Current | Allowed next state | Required condition |
|---|---|---|
| open | in_field, awaiting_review, closed | Closing requires conclusion and closure note. |
| in_field | open, awaiting_review | Return to open/awaiting review records a reason. |
| awaiting_review | open, in_field, closed | Closing requires conclusion and closure note. |
| closed | none | Terminal; reopen by creating a new investigation linked to alert, preserving history. |

Every transition records actor, timestamp, prior/next state and reason in append-only `investigation_events`. Closing with `conclusion=unresolved` is allowed only with an explicit closure note; closure does not imply field confirmation. `change_confirmed` requires an observation/review reference and remains an investigator conclusion, distinct from raw model prediction.

Alert/investigation coupling: moving a triaged alert to `investigating` requires an active investigation. Creating an investigation is permitted only while triaged; it does not silently change alert state. An alert cannot resolve while an investigation is active; an investigator closes the case, then an authorized Forest Officer/Administrator resolves the alert. Dismissal is allowed only when no investigation is active. These guards and corresponding alert/investigation events are enforced transactionally.

`POST /investigations/{id}/observations` body `FieldObservationCreate {observed_at: datetime UTC, observer_name: str|null, observation_type: forest_cover|land_use|fire|harvest|other, finding: str, verification_status: unverified|supports_change|does_not_support_change|inconclusive, location: GeoJSON Point|null (EPSG:4326), evidence_ids: UUID[], notes: str|null}`; observer ID and recorded time are server-derived. Returns `201 FieldObservationRead`, including ID, investigation, actor/observer, observed/recorded times, all submitted fields, supersedes_observation_id|null. Records are immutable; correction appends a superseding observation. `GET /investigations/{id}/observations?page=&page_size=` returns `Page[FieldObservationRead]`.

## Asset upload and retrieval

`POST /assets` accepts authenticated multipart file upload and metadata fields `{kind, provenance: object}`; server enforces per-kind byte limit, allowlisted media types and content signature/format checks. Returns `201 AssetRead` and never returns a filesystem path. `AssetRead`: `{id: UUID, kind, media_type, checksum_sha256, size_bytes, created_at, provenance, spatial_metadata|null}`. `GET /assets/{asset_id}` returns metadata after object-level authorization. `GET /assets/{asset_id}/content` streams the file after authentication, division/object authorization, and safe content-disposition; alternatively a future object store may return a short-lived authorized URL. No API accepts path/key from caller. Upload errors are 413/415/422 and partial files are removed.

## Reports

`POST /investigations/{id}/reports` body `ReportCreate {template_version: str|null}` returns `202 ReportRead` with report ID/status URL. `GET /reports/{id}` returns `ReportRead {id, investigation_id, status: queued|running|succeeded|failed, created_at, completed_at|null, template_version, checksum|null, asset_id|null, failure_code|null, failure_message|null, download_url|null}`. When succeeded, authorized download is via asset content route. Report includes source products/dates, preprocessing and model versions, confidence/uncertainty definitions, limitations, alert history and field evidence status. An anomaly alone is never stated as proof of illegal deforestation.

## Boundary and common geospatial schemas

`origin`: `official|demo` for divisions; monitoring areas also allow `user_drawn|user_imported`. `source_type`: `government_authoritative|other_authoritative|demonstration|synthetic|user_supplied`. `review_status`: `pending_review|approved|rejected|demo_only`. Official source authority is required; URI, version, date, and license are retained when available. Official data begins pending review; only audited approval makes it operationally eligible. Demo/synthetic data is fixed to `demo_only`, has a visible label and cannot be promoted to official. Inputs/outputs never claim an invented boundary is official.

All API GeoJSON uses RFC 7946 EPSG:4326 longitude/latitude; no `crs` member. Backend transforms incoming geometry into the selected internal PostGIS SRID and transforms results to EPSG:4326. Each stored geometry has explicit SRID and source CRS/transformation provenance. Raster assets retain their native CRS/transform/resolution and are not silently reprojected. Area uses appropriate projected/geodesic calculations, not degrees.

## Change process

Endpoint, schema, role, error, state, or version changes update this document. OpenAPI generated from Pydantic is the backend contract source; frontend Zod schemas match it. Breaking shared GIS/AI/backend contract changes increment major contract version and require coordinated rollout. Database schema changes use reviewed Alembic migrations only.
