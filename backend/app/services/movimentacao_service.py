from mysql.connector import IntegrityError

from app.database import obter_conexao
from app.models.movimentacao_model import (
    RespostaCategoria,
    RespostaMovimentacao,
    SolicitacaoCategoria,
    SolicitacaoMovimentacao,
)


class ErroCategoriaInvalida(Exception):
    """Indica que a categoria não existe, não é do usuário ou tem tipo diferente."""


class ErroCategoriaJaCadastrada(Exception):
    """Indica que o usuário já possui uma categoria com este nome e tipo."""


class ErroMovimentacaoNaoEncontrada(Exception):
    """Indica que a movimentação não existe para o usuário informado."""


_SELECT_MOVIMENTACAO = """
    SELECT m.id_movimentacao, m.id_categoria, c.nome AS nome_categoria,
           m.descricao, m.tipo, m.natureza, m.valor,
           m.data_movimentacao, m.observacao
    FROM movimentacao m
    JOIN categoria c ON c.id_categoria = m.id_categoria
    WHERE m.id_usuario = %s
"""


def _consultar(consulta: str, parametros: tuple = ()) -> list[dict]:
    with obter_conexao() as conexao:
        cursor = conexao.cursor(dictionary=True)
        try:
            cursor.execute(consulta, parametros)
            return cursor.fetchall()
        finally:
            cursor.close()


def _executar(comando: str, parametros: tuple) -> tuple[int, int]:
    """Executa um comando de escrita e retorna (último id, linhas afetadas)."""
    with obter_conexao() as conexao:
        cursor = conexao.cursor()
        try:
            cursor.execute(comando, parametros)
            conexao.commit()
            return cursor.lastrowid, cursor.rowcount
        finally:
            cursor.close()


def _validar_categoria(id_usuario: int, dados: SolicitacaoMovimentacao) -> None:
    categoria = _consultar(
        "SELECT 1 FROM categoria "
        "WHERE id_categoria = %s AND id_usuario = %s AND tipo = %s AND ativo = TRUE",
        (dados.id_categoria, id_usuario, dados.tipo),
    )
    if not categoria:
        raise ErroCategoriaInvalida


def _valores(dados: SolicitacaoMovimentacao) -> tuple:
    return (
        dados.id_categoria,
        dados.descricao.strip(),
        dados.tipo,
        dados.natureza,
        dados.valor,
        dados.data_movimentacao,
        dados.observacao,
    )


def listar_categorias(id_usuario: int) -> list[RespostaCategoria]:
    registros = _consultar(
        "SELECT id_categoria, nome, tipo FROM categoria "
        "WHERE id_usuario = %s AND ativo = TRUE ORDER BY nome",
        (id_usuario,),
    )
    return [RespostaCategoria(**registro) for registro in registros]


def cadastrar_categoria(id_usuario: int, dados: SolicitacaoCategoria) -> RespostaCategoria:
    nome = dados.nome.strip()
    try:
        id_categoria, _ = _executar(
            "INSERT INTO categoria (id_usuario, nome, tipo) VALUES (%s, %s, %s)",
            (id_usuario, nome, dados.tipo),
        )
    except IntegrityError as erro:
        if erro.errno == 1062:
            raise ErroCategoriaJaCadastrada from erro
        raise
    return RespostaCategoria(id_categoria=id_categoria, nome=nome, tipo=dados.tipo)


def listar_movimentacoes(id_usuario: int) -> list[RespostaMovimentacao]:
    registros = _consultar(
        _SELECT_MOVIMENTACAO
        + " ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC",
        (id_usuario,),
    )
    return [RespostaMovimentacao(**registro) for registro in registros]


def _buscar_movimentacao(id_usuario: int, id_movimentacao: int) -> RespostaMovimentacao:
    registros = _consultar(
        _SELECT_MOVIMENTACAO + " AND m.id_movimentacao = %s",
        (id_usuario, id_movimentacao),
    )
    if not registros:
        raise ErroMovimentacaoNaoEncontrada
    return RespostaMovimentacao(**registros[0])


def cadastrar_movimentacao(
    id_usuario: int, dados: SolicitacaoMovimentacao
) -> RespostaMovimentacao:
    _validar_categoria(id_usuario, dados)
    id_movimentacao, _ = _executar(
        "INSERT INTO movimentacao (id_categoria, descricao, tipo, natureza, valor, "
        "data_movimentacao, observacao, id_usuario) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (*_valores(dados), id_usuario),
    )
    return _buscar_movimentacao(id_usuario, id_movimentacao)


def editar_movimentacao(
    id_usuario: int, id_movimentacao: int, dados: SolicitacaoMovimentacao
) -> RespostaMovimentacao:
    _buscar_movimentacao(id_usuario, id_movimentacao)
    _validar_categoria(id_usuario, dados)
    _executar(
        "UPDATE movimentacao SET id_categoria = %s, descricao = %s, tipo = %s, "
        "natureza = %s, valor = %s, data_movimentacao = %s, observacao = %s "
        "WHERE id_usuario = %s AND id_movimentacao = %s",
        (*_valores(dados), id_usuario, id_movimentacao),
    )
    return _buscar_movimentacao(id_usuario, id_movimentacao)


def excluir_movimentacao(id_usuario: int, id_movimentacao: int) -> None:
    _, linhas = _executar(
        "DELETE FROM movimentacao WHERE id_usuario = %s AND id_movimentacao = %s",
        (id_usuario, id_movimentacao),
    )
    if linhas == 0:
        raise ErroMovimentacaoNaoEncontrada
