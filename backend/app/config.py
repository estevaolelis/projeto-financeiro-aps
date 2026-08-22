from typing import List

from pydantic import BaseModel, Field


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


settings = Settings()
