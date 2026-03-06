from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    elastic_url: str = "http://elastic:elasticpassword@localhost:9200"
    index_name: str = "dissertations"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
