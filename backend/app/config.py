import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _ler_booleano(nome: str, padrao: str) -> bool:
    return os.getenv(nome, padrao).strip().lower() in {"1", "true", "sim"}


def _ler_segredo_jwt() -> str:
    segredo = os.getenv("SEGREDO_JWT", "").strip()
    if len(segredo) < 32:
        raise RuntimeError(
            "Defina SEGREDO_JWT no .env com pelo menos 32 caracteres "
            "(ex.: python -c \"import secrets; print(secrets.token_urlsafe(48))\")."
        )
    return segredo


class Configuracoes(BaseModel):
    nome_aplicacao: str = "API Financeira"
    depuracao: bool = Field(default_factory=lambda: _ler_booleano("DEPURACAO", "false"))
    origens_cors: list[str] = Field(
        default_factory=lambda: [
            origem.strip()
            for origem in os.getenv(
                "ORIGENS_CORS", "http://localhost:5173,http://127.0.0.1:5173"
            ).split(",")
            if origem.strip()
        ]
    )
    url_banco_dados: str = os.getenv(
        "URL_BANCO_DADOS",
        "mysql+pymysql://projeto_financeiro:projeto_financeiro@localhost:3307/projeto_financeiro",
    )
    segredo_jwt: str = Field(default_factory=_ler_segredo_jwt)
    minutos_expiracao_jwt: int = int(os.getenv("MINUTOS_EXPIRACAO_JWT", "60"))
    cookie_seguro: bool = Field(default_factory=lambda: _ler_booleano("COOKIE_SEGURO", "true"))


configuracoes = Configuracoes()
