from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

TipoMovimentacao = Literal["RECEITA", "DESPESA"]
NaturezaMovimentacao = Literal["FIXA", "VARIAVEL"]


class SolicitacaoCategoria(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    tipo: TipoMovimentacao


class RespostaCategoria(BaseModel):
    id_categoria: int
    nome: str
    tipo: TipoMovimentacao


class SolicitacaoMovimentacao(BaseModel):
    id_categoria: int = Field(gt=0)
    descricao: str = Field(min_length=2, max_length=150)
    tipo: TipoMovimentacao
    natureza: NaturezaMovimentacao
    valor: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    data_movimentacao: date
    observacao: str | None = Field(default=None, max_length=500)


class RespostaMovimentacao(SolicitacaoMovimentacao):
    id_movimentacao: int
    nome_categoria: str
