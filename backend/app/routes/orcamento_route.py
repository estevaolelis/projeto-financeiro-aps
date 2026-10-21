from fastapi import APIRouter, status

from app.controllers.orcamento_controller import (
    cadastrar_orcamento,
    editar_orcamento,
    excluir_orcamento,
    listar_orcamentos,
)
from app.models.orcamento_model import RespostaOrcamento

roteador = APIRouter(prefix="/api", tags=["orcamentos"])

roteador.add_api_route(
    "/orcamentos",
    listar_orcamentos,
    methods=["GET"],
    response_model=list[RespostaOrcamento],
)
roteador.add_api_route(
    "/orcamentos",
    cadastrar_orcamento,
    methods=["POST"],
    response_model=RespostaOrcamento,
    status_code=status.HTTP_201_CREATED,
)
roteador.add_api_route(
    "/orcamentos/{id_orcamento}",
    editar_orcamento,
    methods=["PUT"],
    response_model=RespostaOrcamento,
)
roteador.add_api_route(
    "/orcamentos/{id_orcamento}",
    excluir_orcamento,
    methods=["DELETE"],
    status_code=status.HTTP_204_NO_CONTENT,
)
