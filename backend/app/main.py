from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import configuracoes
from app.limitador import limitador
from app.routes.auth_route import roteador as roteador_autenticacao
from app.routes.movimentacao_route import roteador as roteador_movimentacao
from app.routes.orcamento_route import roteador as roteador_orcamento

METODOS_QUE_ALTERAM = {"POST", "PUT", "PATCH", "DELETE"}

aplicacao = FastAPI(
    title=configuracoes.nome_aplicacao,
    debug=configuracoes.depuracao,
)

aplicacao.state.limiter = limitador
aplicacao.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@aplicacao.middleware("http")
async def verificar_origem(requisicao: Request, chamar_proximo):
    origem = requisicao.headers.get("origin")
    if (
        requisicao.method in METODOS_QUE_ALTERAM
        and origem is not None
        and origem not in configuracoes.origens_cors
    ):
        return JSONResponse({"detail": "Origem não permitida"}, status_code=403)
    return await chamar_proximo(requisicao)


aplicacao.add_middleware(
    CORSMiddleware,
    allow_origins=configuracoes.origens_cors,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

aplicacao.include_router(roteador_autenticacao)
aplicacao.include_router(roteador_movimentacao)
aplicacao.include_router(roteador_orcamento)


@aplicacao.get("/")
def ler_raiz():
    return {"mensagem": f"{configuracoes.nome_aplicacao} está no ar."}


@aplicacao.get("/saude")
def verificar_saude():
    return {"situacao": "ok"}
