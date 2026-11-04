from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SYLVASENSE API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://sylvasense:change-me-locally@localhost:5432/sylvasense"
    redis_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"
    earth_engine_project: str | None = None
    earth_engine_service_account: str | None = None
    earth_engine_credentials_path: str | None = None

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
