# Contributing to SYLVASENSE

Thanks for contributing. The project is currently a foundation; proposed changes should preserve clear boundaries between the frontend, API, geospatial workflows, and AI modules.

## Branches and commits

- Keep `main` stable; do not push routine development directly to it.
- Create focused branches such as `feat/alert-review` or `fix/api-health`.
- Use concise, imperative commit subjects that explain the change.

## Pull requests

- Open a pull request for changes targeting `main`.
- Describe the motivation, behavior change, and any operational or scientific implications.
- Link relevant issues; include screenshots for visible UI changes.
- Add or update tests and documentation, especially for API or data contract changes.
- Confirm tests/builds pass and disclose any checks that could not be run.

## Development requirements

- Use Alembic for all schema changes.
- Never commit credentials, real sensitive data, or raw service-account files.
- Preserve CRS and source metadata and clearly distinguish predictions from field-verified observations.
- Never infer illegality solely from satellite-based anomaly detection.
- Follow `AGENTS.md` and the ownership/integration rules in `docs/ARCHITECTURE.md`.

## Reporting issues

Use the bug report or feature request template. Avoid including secrets or sensitive location/person data in public issue reports.
