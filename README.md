# SYLVASENSE

**Forest Intelligence & AI-Powered Deforestation Early Warning System**

SYLVASENSE is a foundation for a geospatial platform to monitor Tamil Nadu forest divisions using satellite data, Earth Engine, change-detection models, and evidence-based alerts. This repository is a project scaffold: it does not yet acquire satellite imagery, define authoritative forest boundaries, or make operational deforestation claims.

## Project objectives

- Support timely, reproducible monitoring workflows for forest divisions.
- Combine satellite-derived indicators with transparent evidence and uncertainty.
- Keep geospatial processing, AI, API, and user-interface modules independently testable.
- Help investigators review potential changes without treating model output as verified field evidence.

## Main features (planned)

- Interactive GIS command-centre map with Google Maps and analytical overlays.
- Sentinel-1/Sentinel-2 acquisition and preprocessing workflows.
- Change-detection results with source dates, model versions, confidence, and uncertainty.
- Evidence-based alert investigation, analytics, and report workflows.
- Background processing with Celery and Redis.

These are architectural goals, not claims of currently implemented functionality.

## Architecture

```text
React + TypeScript + Vite
          │ JSON API
          ▼
FastAPI ─ SQLAlchemy 2 ─ PostgreSQL/PostGIS
          │                     │
          ├── Celery workers ─ Redis
          ├── Earth Engine / geospatial processing
          └── AI model interfaces
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module ownership and integration contracts, and [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) for the initial API shape.

## Technology stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS (shadcn/ui-compatible styling setup), React Router, TanStack Query, Zod, Google Maps JavaScript API, Recharts, Vitest, Playwright.
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy 2, Alembic, PostgreSQL/PostGIS, Redis, Celery, pytest.
- **Geospatial:** Google Earth Engine Python API, Sentinel-1/2, Rasterio, GDAL, GeoPandas, Shapely.
- **AI/ML:** PyTorch, scikit-learn, XGBoost, DeepForest; SAM2 is an optional future module.
- **Testing:** pytest, Vitest, Playwright browser smoke tests.
- **Infrastructure:** Docker, Docker Compose, GitHub Actions.

## Repository structure

```text
frontend/       React application and UI features
backend/        FastAPI application, persistence, API, workers
geospatial/     Earth Engine, acquisition, processing, and validation
ai_models/      Model interfaces, training, evaluation, and inference
database/       Database reference schemas, seeds, and spatial guidance
infrastructure/ Docker, deployment, monitoring, and scripts
tests/          Cross-module test areas
docs/           Architecture, contracts, data, security, and operations
```

## Prerequisites

- Git
- Node.js 20+ and npm
- Python 3.11+
- Docker Desktop with Docker Compose (recommended for PostgreSQL/PostGIS and Redis)
- Optional for Earth Engine: an enabled Google Cloud project and Earth Engine credentials
- Optional for Google Maps: a Google Maps JavaScript API key with the required APIs enabled

## Installation

Clone the repository and configure environment values:

```bash
git clone <repository-url> sylvasense
cd sylvasense
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env`. Do not commit `.env` or credentials.

### Environment variables

The root `.env.example` documents the variables used by the API, database, Redis/Celery, Earth Engine, and frontend. At minimum, configure `DATABASE_URL`, `REDIS_URL`, and `VITE_API_BASE_URL` for local development. Set `VITE_GOOGLE_MAPS_API_KEY` only when enabling the map integration. Earth Engine authentication is optional until imagery processing is implemented; configure the project and credentials according to the [Earth Engine setup](#earth-engine-setup) section.

### Running the frontend

```bash
cd frontend
npm ci
npm run dev
```

The Vite development server prints its local URL. Useful commands: `npm run build`, `npm run test`, and `npm run test:watch`.

### Running the backend

Start PostgreSQL/PostGIS and Redis first (see Docker setup), then:

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is served at `http://localhost:8000`; interactive OpenAPI docs are at `/docs`. Health is available at `/api/v1/health`. Run backend tests with `pytest`.

### Docker setup

From the repository root:

```bash
docker compose up --build
```

The compose stack includes PostGIS, Redis, the API, and a Celery worker. The frontend is run separately using the command above. Stop services with `docker compose down`; persistent database data is stored in the named `postgres_data` volume.

### Earth Engine setup

Earth Engine is not required for API or frontend development. To enable it, use a Google Cloud project with Earth Engine access and authenticate using the official Earth Engine Python API instructions. Set `EARTH_ENGINE_PROJECT`. For service-account authentication, provide `EARTH_ENGINE_SERVICE_ACCOUNT` and a credential file at `EARTH_ENGINE_CREDENTIALS_PATH`; keep that file outside version control. The initialization helper fails explicitly if required configuration or the client library is missing. Never commit service-account JSON.

## Testing

```bash
# Frontend
cd frontend
npm run test
npm run build
npm run test:e2e

# Backend (from backend/)
pytest
```

The GitHub Actions workflow runs frontend install/build/unit/browser tests and backend tests. Run the initial browser smoke test with `cd frontend && npm run test:e2e`; install the browser once with `npx playwright install chromium` from the frontend folder. Broader integration tests are reserved for later implementation.

For optional image-processing/model development, install `backend/requirements-geospatial.txt` (requires a compatible native GDAL installation) or `backend/requirements-ml.txt`. SAM2 is intentionally not installed by default.

## Contribution guidelines

Use `main` as the stable branch. Create a focused feature or fix branch, add or update tests, document API changes, and open a pull request for review. See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).

## Scientific and data integrity

- Do not fabricate satellite observations or present invented boundaries as official.
- Preserve coordinate reference systems and source geospatial metadata.
- Record imagery acquisition dates and model versions.
- Keep confidence and uncertainty distinct from operational severity.
- Clearly distinguish AI predictions from verified field observations.
- A satellite anomaly alone is not proof of illegal deforestation.
- Mark synthetic or demonstration fixtures explicitly.

## Security

Never commit credentials, API keys, service-account JSON, or real sensitive operational data. Use least-privilege credentials and environment-based configuration. Report suspected vulnerabilities privately to repository maintainers. See [docs/SECURITY.md](docs/SECURITY.md).

## License

This project is distributed under the MIT License; see [LICENSE](LICENSE).
