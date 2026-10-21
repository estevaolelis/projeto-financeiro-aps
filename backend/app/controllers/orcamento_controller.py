from fastapi import Depends, HTTPException, Query, status

from app.controllers.auth_controller import obter_usuario_atual
from app.models.auth_model import RespostaUsuario
from app.models.orcamento_model import (
    RespostaOrcamento,
    SolicitacaoAtualizacaoOrcamento,
    SolicitacaoOrcamento,
)
from app.services import orcamento_service as servico
from app.services.orcamento_service import (
    ErroCategoriaInvalida,
    ErroOrcamentoJaCadastrado,
    ErroOrcamentoNaoEncontrado,
)

ERRO_NAO_ENCONTRADO = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Orçamento não encontrado",
)


def listar_orcamentos(
    mes: int = Query(ge=1, le=12),
    ano: int = Query(ge=2000, le=9999),
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> list[RespostaOrcamento]:
    return servico.listar_orcamentos(usuario.id_usuario, mes, ano)


def cadastrar_orcamento(
    dados: SolicitacaoOrcamento,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaOrcamento:
    try:
        return servico.cadastrar_orcamento(usuario.id_usuario, dados)
    except ErroCategoriaInvalida as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selecione uma categoria de despesa válida",
        ) from erro
    except ErroOrcamentoJaCadastrado as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um orçamento para esta categoria neste mês",
        ) from erro


def editar_orcamento(
    id_orcamento: int,
    dados: SolicitacaoAtualizacaoOrcamento,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaOrcamento:
    try:
        return servico.editar_orcamento(usuario.id_usuario, id_orcamento, dados)
    except ErroOrcamentoNaoEncontrado as erro:
        raise ERRO_NAO_ENCONTRADO from erro


def excluir_orcamento(
    id_orcamento: int,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> None:
    try:
        servico.excluir_orcamento(usuario.id_usuario, id_orcamento)
    except ErroOrcamentoNaoEncontrado as erro:
        raise ERRO_NAO_ENCONTRADO from erro
