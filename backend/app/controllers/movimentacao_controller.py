from fastapi import Depends, HTTPException, status

from app.controllers.auth_controller import obter_usuario_atual
from app.models.auth_model import RespostaUsuario
from app.models.movimentacao_model import (
    RespostaCategoria,
    RespostaMovimentacao,
    SolicitacaoCategoria,
    SolicitacaoMovimentacao,
)
from app.services import movimentacao_service as servico
from app.services.movimentacao_service import (
    ErroCategoriaInvalida,
    ErroCategoriaJaCadastrada,
    ErroMovimentacaoNaoEncontrada,
)

ERRO_CATEGORIA_INVALIDA = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Categoria inválida para este tipo de movimentação",
)
ERRO_NAO_ENCONTRADA = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Movimentação não encontrada",
)


def listar_categorias(
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> list[RespostaCategoria]:
    return servico.listar_categorias(usuario.id_usuario)


def cadastrar_categoria(
    dados: SolicitacaoCategoria,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaCategoria:
    try:
        return servico.cadastrar_categoria(usuario.id_usuario, dados)
    except ErroCategoriaJaCadastrada as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Esta categoria já existe",
        ) from erro


def listar_movimentacoes(
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> list[RespostaMovimentacao]:
    return servico.listar_movimentacoes(usuario.id_usuario)


def cadastrar_movimentacao(
    dados: SolicitacaoMovimentacao,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaMovimentacao:
    try:
        return servico.cadastrar_movimentacao(usuario.id_usuario, dados)
    except ErroCategoriaInvalida as erro:
        raise ERRO_CATEGORIA_INVALIDA from erro


def editar_movimentacao(
    id_movimentacao: int,
    dados: SolicitacaoMovimentacao,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaMovimentacao:
    try:
        return servico.editar_movimentacao(usuario.id_usuario, id_movimentacao, dados)
    except ErroMovimentacaoNaoEncontrada as erro:
        raise ERRO_NAO_ENCONTRADA from erro
    except ErroCategoriaInvalida as erro:
        raise ERRO_CATEGORIA_INVALIDA from erro


def excluir_movimentacao(
    id_movimentacao: int,
    usuario: RespostaUsuario = Depends(obter_usuario_atual),
) -> None:
    try:
        servico.excluir_movimentacao(usuario.id_usuario, id_movimentacao)
    except ErroMovimentacaoNaoEncontrada as erro:
        raise ERRO_NAO_ENCONTRADA from erro
