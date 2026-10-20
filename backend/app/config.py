"""
Typed configuration using pydantic-settings for the backend.
Never hardcodes credentials. Reads from environment variables or .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = True
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # Azure SQL Database (SQLAlchemy 2.0 Core + pyodbc)
    azure_sql_connection_string: str = "mssql+pyodbc://sa:YourStrongPassword123@localhost:1433/customer_quality_db?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=yes"

    # JWT Authentication
    jwt_secret_key: str = "super-secret-jwt-key-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    # Azure Blob Storage
    azure_storage_connection_string: str = ""
    azure_storage_container_name: str = "customer-records-private"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
