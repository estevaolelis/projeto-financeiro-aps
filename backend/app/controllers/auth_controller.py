from fastapi import Cookie, Depends, HTTPException, Request, Response, status

from app.config import configuracoes
from app.limitador import limitador
from app.models.auth_model import (
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

NOME_COOKIE_SESSAO = "financeiro_sessao"


def obter_usuario_atual(
    token: str | None = Cookie(default=None, alias=NOME_COOKIE_SESSAO),
) -> RespostaUsuario:
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão ausente",
        )
    try:
        return obter_usuario_do_token(token)
    except (ErroTokenInvalido, ErroUsuarioNaoEncontrado) as erro:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada",
        ) from erro


@limitador.limit("10/hour")
def cadastrar(request: Request, dados: SolicitacaoCadastro) -> RespostaUsuario:
    try:
        return cadastrar_usuario(dados)
    except ErroEmailJaCadastrado as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail já está cadastrado",
        ) from erro


@limitador.limit("5/minute")
def entrar(request: Request, response: Response, dados: SolicitacaoEntrada) -> RespostaUsuario:
    try:
        token, usuario = autenticar_usuario(dados)
    except ErroCredenciaisInvalidas as erro:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos",
        ) from erro
    
    response.set_cookie(
        key=NOME_COOKIE_SESSAO,
        value=token,
        max_age=configuracoes.minutos_expiracao_jwt * 60,
        path="/",
        httponly=True,
        secure=configuracoes.cookie_seguro,
        samesite="lax",
    )
    return usuario


def sair(response: Response) -> None:
    response.delete_cookie(
        key=NOME_COOKIE_SESSAO,
        path="/",
        httponly=True,
        secure=configuracoes.cookie_seguro,
        samesite="lax",
    )


def eu(
    usuario_atual: RespostaUsuario = Depends(obter_usuario_atual),
) -> RespostaUsuario:
    return usuario_atual
