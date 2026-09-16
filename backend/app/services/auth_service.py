from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from mysql.connector import IntegrityError

from app.config import configuracoes
from app.database import obter_conexao
from app.models.auth_model import (
    RespostaEntrada,
    RespostaUsuario,
    SolicitacaoCadastro,
    SolicitacaoEntrada,
)


class ErroEmailJaCadastrado(Exception):
    """Indica que o e-mail informado já pertence a outro usuário."""


class ErroCredenciaisInvalidas(Exception):
    """Indica que as credenciais de acesso não são válidas."""


class ErroTokenInvalido(Exception):
    """Indica que o token não pode ser usado para autenticação."""


class ErroUsuarioNaoEncontrado(Exception):
    """Indica que o usuário do token não existe mais."""


def _criar_token(id_usuario: int) -> str:
    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=configuracoes.minutos_expiracao_jwt
    )
    return jwt.encode(
        {"sub": str(id_usuario), "exp": expira_em},
        configuracoes.segredo_jwt,
        algorithm="HS256",
    )


def _para_resposta_usuario(registro: tuple[object, ...]) -> RespostaUsuario:
    return RespostaUsuario(
        id_usuario=int(registro[0]),
        nome=str(registro[1]),
        email=str(registro[2]),
    )


def cadastrar_usuario(dados: SolicitacaoCadastro) -> RespostaUsuario:
    nome = dados.nome.strip()
    email = dados.email.lower()
    hash_senha = bcrypt.hashpw(dados.senha.encode(), bcrypt.gensalt()).decode()

    try:
        with obter_conexao() as conexao:
            cursor = conexao.cursor()
            try:
                cursor.execute(
                    "INSERT INTO usuario (nome, email, senha_hash) VALUES (%s, %s, %s)",
                    (nome, email, hash_senha),
                )
                conexao.commit()
                id_usuario = cursor.lastrowid
            finally:
                cursor.close()
    except IntegrityError as erro:
        if erro.errno == 1062:
            raise ErroEmailJaCadastrado from erro
        raise

    return RespostaUsuario(id_usuario=int(id_usuario), nome=nome, email=email)


def autenticar_usuario(dados: SolicitacaoEntrada) -> RespostaEntrada:
    with obter_conexao() as conexao:
        cursor = conexao.cursor()
        try:
            cursor.execute(
                "SELECT id_usuario, nome, email, senha_hash FROM usuario WHERE email = %s",
                (dados.email.lower(),),
            )
            registro = cursor.fetchone()
        finally:
            cursor.close()

    if registro is None or not bcrypt.checkpw(
        dados.senha.encode(), str(registro[3]).encode()
    ):
        raise ErroCredenciaisInvalidas

    usuario = _para_resposta_usuario(registro)
    return RespostaEntrada(
        token_acesso=_criar_token(usuario.id_usuario),
        usuario=usuario,
    )


def obter_usuario_do_token(token: str) -> RespostaUsuario:
    try:
        conteudo = jwt.decode(
            token,
            configuracoes.segredo_jwt,
            algorithms=["HS256"],
        )
        id_usuario = int(conteudo["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as erro:
        raise ErroTokenInvalido from erro

    with obter_conexao() as conexao:
        cursor = conexao.cursor()
        try:
            cursor.execute(
                "SELECT id_usuario, nome, email FROM usuario WHERE id_usuario = %s",
                (id_usuario,),
            )
            registro = cursor.fetchone()
        finally:
            cursor.close()

    if registro is None:
        raise ErroUsuarioNaoEncontrado
    return _para_resposta_usuario(registro)
