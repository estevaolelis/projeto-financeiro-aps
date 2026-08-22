"""
Configurações da aplicação.
"""
from typing import List

class Settings:
    PROJECT_NAME: str = "API de Educação e Orientação Financeira"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Origens permitidas para CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

settings = Settings()
