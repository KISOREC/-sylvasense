# Architecture and module ownership

## System overview

The React/TypeScript frontend consumes a versioned JSON API from FastAPI. The API owns validation, authentication policy (to be designed before deployment), persistence, and orchestration. PostgreSQL/PostGIS stores application and spatial records; Redis supports Celery task brokering/results. Worker tasks coordinate processing but should call the independently testable geospatial and AI modules rather than embedding algorithms.

## Ownership

| Area | Owns | Must not own |
|---|---|---|
| `frontend/` | Presentation, navigation, client validation, API client | Secret credentials, scientific source-of-truth data |
| `backend/app/api/` | HTTP routes and request/response contracts | Long-running algorithms or duplicated UI state |
| `backend/app/models/`, `repositories/` | Persistence mappings and data access | Satellite algorithm implementations |
| `backend/app/services/`, `workers/` | Application orchestration and background tasks | Unversioned model behavior |
| `geospatial/` | Source search, raster/vector processing, provenance | Operational alert adjudication |
| `ai_models/` | Versioned inference/training/evaluation interfaces | Claims of field verification |
| `database/` | Data dictionary, spatial conventions, seeds | A second migration mechanism |

## Integration contracts

- Frontend calls the API using the shared response envelope in `docs/API_CONTRACTS.md`.
- Background work is submitted through application services/tasks; task payloads reference persisted assets rather than embedding large rasters.
- Geospatial results retain source asset IDs, acquisition dates, CRS, processing provenance, and model metadata.
- A prediction is not a verified observation. Confidence and uncertainty are distinct fields; operational severity is a separate human-reviewed concept.
- Schema changes are made with Alembic and reviewed before application.
- Earth Engine initialization is explicit and requires configured credentials/project; importing modules must not initiate network access.

## User experience direction

The planned GIS command centre uses deep charcoal/navy surfaces, forest-green accents, red forest-loss overlays, amber warning indicators, a Google satellite basemap, and Earth Engine analytical overlays. Operational use requires authorized and provenance-backed data; none is fabricated or bundled by this scaffold.
