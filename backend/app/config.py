import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings(BaseModel):
    app_name: str = "API Financeira"
    debug: bool = True
    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )
    database_url: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://projeto_financeiro:projeto_financeiro@localhost:3307/projeto_financeiro",
    )
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    jwt_expiration_minutes: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "120"))


settings = Settings()
