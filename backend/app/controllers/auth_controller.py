from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.auth_model import (
    RespostaEntrada,
    RespostaUsuario,
    SolicitacaoCadastro,
    SolicitacaoEntrada,
)
from app.services.auth_service import (
    ErroCredenciaisInvalidas,
    ErroEmailJaCadastrado,
    ErroTokenInvalido,
    ErroUsuarioNaoEncontrado,
    autenticar_usuario,
    cadastrar_usuario,
    obter_usuario_do_token,
)

esquema_portador = HTTPBearer(auto_error=False)


def obter_usuario_atual(credenciais: HTTPAuthorizationCredentials | None = Depends(esquema_portador)) -> RespostaUsuario:
    if credenciais is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente",
        )
    try:
        return obter_usuario_do_token(credenciais.credentials)
    except ErroTokenInvalido as erro:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        ) from erro
    except ErroUsuarioNaoEncontrado as erro:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        ) from erro


def cadastrar(dados: SolicitacaoCadastro) -> RespostaUsuario:
    try:
        return cadastrar_usuario(dados)
    except ErroEmailJaCadastrado as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail já está cadastrado",
        ) from erro


def entrar(dados: SolicitacaoEntrada) -> RespostaEntrada:
    try:
        return autenticar_usuario(dados)
    except ErroCredenciaisInvalidas as erro:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos",
        ) from erro


def eu(
    usuario_atual: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaUsuario:
    return usuario_atual
