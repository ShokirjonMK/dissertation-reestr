from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_url: str = "postgresql+psycopg2://registry_user:registry_password@localhost:5432/dissertation_registry"
    redis_url: str = "redis://localhost:6379/0"
    elastic_url: str = "http://elastic:elasticpassword@localhost:9200"
    ai_service_url: str = "http://localhost:8002"
    search_service_url: str = "http://localhost:8001"
    integration_service_url: str = "http://localhost:8003"
    file_storage_path: str = "/app/storage"

    jwt_secret: str = "change_me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120

    oneid_client_id: str = "placeholder-client"
    oneid_client_secret: str = "placeholder-secret"
    oneid_redirect_uri: str = "http://localhost:8000/api/v1/auth/oneid/callback"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://86.48.3.80:3000",
        "http://86.48.3.80",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
