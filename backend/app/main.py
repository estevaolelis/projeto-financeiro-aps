from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import configuracoes
from app.routes.auth_route import roteador as roteador_autenticacao
from app.routes.exemplo_route import roteador as roteador_exemplo

aplicacao = FastAPI(
    title=configuracoes.nome_aplicacao,
    debug=configuracoes.depuracao,
)

aplicacao.add_middleware(
    CORSMiddleware,
    allow_origins=configuracoes.origens_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

aplicacao.include_router(roteador_exemplo)
aplicacao.include_router(roteador_autenticacao)


@aplicacao.get("/")
def ler_raiz():
    return {"mensagem": f"{configuracoes.nome_aplicacao} está no ar."}


@aplicacao.get("/saude")
def verificar_saude():
    return {"situacao": "ok"}
