"""Explicit Earth Engine client initialization; credentials are never bundled."""

import ee

from app.core.config import settings


def initialize_earth_engine() -> None:
    """Initialize Earth Engine using configured ADC or service-account credentials."""
    if not settings.earth_engine_project:
        raise RuntimeError("EARTH_ENGINE_PROJECT must be configured to use Earth Engine")

    if settings.earth_engine_service_account:
        if not settings.earth_engine_credentials_path:
            raise RuntimeError(
                "EARTH_ENGINE_CREDENTIALS_PATH is required with a service account"
            )
        credentials = ee.ServiceAccountCredentials(
            settings.earth_engine_service_account,
            settings.earth_engine_credentials_path,
        )
        ee.Initialize(credentials, project=settings.earth_engine_project)
        return

    ee.Initialize(project=settings.earth_engine_project)
