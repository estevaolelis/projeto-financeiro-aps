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
        "URL_BANCO_DADOS",
        "mysql+pymysql://projeto_financeiro:projeto_financeiro@localhost:3307/projeto_financeiro",
    )
    segredo_jwt: str = os.getenv(
        "SEGREDO_JWT",
        "altere-este-segredo-em-desenvolvimento",
    )
    minutos_expiracao_jwt: int = int(os.getenv("MINUTOS_EXPIRACAO_JWT", "120"))


configuracoes = Configuracoes()
