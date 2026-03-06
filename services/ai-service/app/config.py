from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    search_service_url: str = "http://localhost:8001"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
