from decimal import ROUND_HALF_UP, Decimal

from mysql.connector import IntegrityError

from app.models.orcamento_model import (
    RespostaOrcamento,
    SolicitacaoAtualizacaoOrcamento,
    SolicitacaoOrcamento,
)
from app.services.movimentacao_service import _consultar, _executar


class ErroCategoriaInvalida(Exception):
    """Indica que a categoria não existe, não é do usuário ou não é de despesa."""


class ErroOrcamentoJaCadastrado(Exception):
    """Indica que já existe orçamento para a categoria no mês/ano informado."""


class ErroOrcamentoNaoEncontrado(Exception):
    """Indica que o orçamento não existe para o usuário informado."""


_SELECT_ORCAMENTO = """
    SELECT o.id_orcamento, o.id_categoria, c.nome AS nome_categoria,
           o.mes, o.ano, o.valor_limite, o.percentual_alerta,
           COALESCE((
               SELECT SUM(m.valor) FROM movimentacao m
               WHERE m.id_usuario = o.id_usuario
                 AND m.id_categoria = o.id_categoria
                 AND m.tipo = 'DESPESA'
                 AND MONTH(m.data_movimentacao) = o.mes
                 AND YEAR(m.data_movimentacao) = o.ano
           ), 0) AS valor_gasto
    FROM orcamento o
    JOIN categoria c ON c.id_categoria = o.id_categoria
    WHERE o.id_usuario = %s
"""


def _montar(registro: dict) -> RespostaOrcamento:
    limite = Decimal(registro["valor_limite"])
    gasto = Decimal(registro["valor_gasto"])
    percentual = (gasto / limite * 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return RespostaOrcamento(
        **registro,
        valor_restante=limite - gasto,
        percentual_utilizado=percentual,
    )


def _buscar(id_usuario: int, id_orcamento: int) -> RespostaOrcamento:
    registros = _consultar(
        _SELECT_ORCAMENTO + " AND o.id_orcamento = %s", (id_usuario, id_orcamento)
    )
    if not registros:
        raise ErroOrcamentoNaoEncontrado
    return _montar(registros[0])


def listar_orcamentos(id_usuario: int, mes: int, ano: int) -> list[RespostaOrcamento]:
    registros = _consultar(
        _SELECT_ORCAMENTO + " AND o.mes = %s AND o.ano = %s ORDER BY c.nome",
        (id_usuario, mes, ano),
    )
    return [_montar(registro) for registro in registros]


def cadastrar_orcamento(id_usuario: int, dados: SolicitacaoOrcamento) -> RespostaOrcamento:
    categoria = _consultar(
        "SELECT 1 FROM categoria "
        "WHERE id_categoria = %s AND id_usuario = %s AND tipo = 'DESPESA' AND ativo = TRUE",
        (dados.id_categoria, id_usuario),
    )
    if not categoria:
        raise ErroCategoriaInvalida
    try:
        id_orcamento, _ = _executar(
            "INSERT INTO orcamento (id_usuario, id_categoria, mes, ano, valor_limite) "
            "VALUES (%s, %s, %s, %s, %s)",
            (id_usuario, dados.id_categoria, dados.mes, dados.ano, dados.valor_limite),
        )
    except IntegrityError as erro:
        if erro.errno == 1062:
            raise ErroOrcamentoJaCadastrado from erro
        raise
    return _buscar(id_usuario, id_orcamento)


def editar_orcamento(
    id_usuario: int, id_orcamento: int, dados: SolicitacaoAtualizacaoOrcamento
) -> RespostaOrcamento:
    _buscar(id_usuario, id_orcamento)
    _executar(
        "UPDATE orcamento SET valor_limite = %s WHERE id_usuario = %s AND id_orcamento = %s",
        (dados.valor_limite, id_usuario, id_orcamento),
    )
    return _buscar(id_usuario, id_orcamento)


def excluir_orcamento(id_usuario: int, id_orcamento: int) -> None:
    _, linhas = _executar(
        "DELETE FROM orcamento WHERE id_usuario = %s AND id_orcamento = %s",
        (id_usuario, id_orcamento),
    )
    if linhas == 0:
        raise ErroOrcamentoNaoEncontrado
