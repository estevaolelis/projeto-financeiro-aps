from fastapi import APIRouter, status

from app.controllers.movimentacao_controller import (
    cadastrar_categoria,
    cadastrar_movimentacao,
    editar_movimentacao,
    excluir_movimentacao,
    listar_categorias,
    listar_movimentacoes,
)
from app.models.movimentacao_model import RespostaCategoria, RespostaMovimentacao

roteador = APIRouter(prefix="/api", tags=["movimentacoes"])

roteador.add_api_route(
    "/categorias",
    listar_categorias,
    methods=["GET"],
    response_model=list[RespostaCategoria],
)
roteador.add_api_route(
    "/categorias",
    cadastrar_categoria,
    methods=["POST"],
    response_model=RespostaCategoria,
    status_code=status.HTTP_201_CREATED,
)
roteador.add_api_route(
    "/movimentacoes",
    listar_movimentacoes,
    methods=["GET"],
    response_model=list[RespostaMovimentacao],
)
roteador.add_api_route(
    "/movimentacoes",
    cadastrar_movimentacao,
    methods=["POST"],
    response_model=RespostaMovimentacao,
    status_code=status.HTTP_201_CREATED,
)
roteador.add_api_route(
    "/movimentacoes/{id_movimentacao}",
    editar_movimentacao,
    methods=["PUT"],
    response_model=RespostaMovimentacao,
)
roteador.add_api_route(
    "/movimentacoes/{id_movimentacao}",
    excluir_movimentacao,
    methods=["DELETE"],
    status_code=status.HTTP_204_NO_CONTENT,
)
