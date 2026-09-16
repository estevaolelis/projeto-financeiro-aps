from fastapi import APIRouter, status

from app.controllers.auth_controller import cadastrar, entrar, eu
from app.models.auth_model import RespostaEntrada, RespostaUsuario

roteador = APIRouter(prefix="/api/autenticacao", tags=["autenticacao"])

roteador.add_api_route(
    "/cadastro",
    cadastrar,
    methods=["POST"],
    response_model=RespostaUsuario,
    status_code=status.HTTP_201_CREATED,
)
roteador.add_api_route(
    "/entrar",
    entrar,
    methods=["POST"],
    response_model=RespostaEntrada,
)
roteador.add_api_route("/eu", eu, methods=["GET"], response_model=RespostaUsuario)
