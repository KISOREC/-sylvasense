# Database conventions

`schemas/` documents logical data contracts, `spatial/` describes PostGIS conventions, `seeds/` contains explicitly identified non-operational development data, and `migrations/` links to the API's Alembic history. Alembic is the sole schema-change mechanism.

Do not treat demonstration fixtures as observations or invented boundaries as authoritative.
