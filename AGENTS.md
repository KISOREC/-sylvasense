# Repository agent and contributor rules

## Project boundaries

- Keep frontend, backend, geospatial processing, and AI model code independently testable.
- Follow module ownership and integration contracts in `docs/ARCHITECTURE.md`.
- Do not implement the full production platform as part of a scaffold or unrelated change.

## Engineering standards

- Use focused changes, meaningful names, type annotations, and repository conventions.
- Add or update tests for behavior changes; run relevant tests and builds before proposing completion.
- API changes must update `docs/API_CONTRACTS.md`.
- Use Alembic for every database schema change; do not modify schemas only by ad hoc SQL.
- Keep secrets out of source, logs, fixtures, and frontend environment variables. Never check in credentials or service-account JSON.
- Surface configuration and processing failures; do not silently substitute fake values or success-shaped defaults.
- Preserve CRS and geospatial metadata through all geospatial transformations.

## Scientific integrity

- Never fabricate satellite observations.
- Never label invented forest boundaries as official boundaries.
- Clearly label synthetic demonstration fixtures.
- Keep model predictions distinct from verified field observations.
- Record imagery dates and model versions; store confidence and uncertainty separately from operational severity.
- Satellite anomaly detection alone must never be described as proof of illegal deforestation.

## Git and review

- `main` is the stable branch. Use feature branches and pull requests.
- Use meaningful commit messages; include tests and documentation updates where appropriate.
