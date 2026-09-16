import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Configuracoes(BaseModel):
    nome_aplicacao: str = "API Financeira"
    depuracao: bool = True
    origens_cors: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )
    url_banco_dados: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://projeto_financeiro:projeto_financeiro@localhost:3307/projeto_financeiro",
    )
    segredo_jwt: str = os.getenv("JWT_SECRET", "altere-este-segredo-em-desenvolvimento")
    minutos_expiracao_jwt: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "120"))


configuracoes = Configuracoes()
