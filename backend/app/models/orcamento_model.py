from decimal import Decimal

from pydantic import BaseModel, Field


class SolicitacaoOrcamento(BaseModel):
    id_categoria: int = Field(gt=0)
    mes: int = Field(ge=1, le=12)
    ano: int = Field(ge=2000, le=9999)
    valor_limite: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class SolicitacaoAtualizacaoOrcamento(BaseModel):
    valor_limite: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class RespostaOrcamento(BaseModel):
    id_orcamento: int
    id_categoria: int
    nome_categoria: str
    mes: int
    ano: int
    valor_limite: Decimal
    percentual_alerta: Decimal
    valor_gasto: Decimal
    valor_restante: Decimal
    percentual_utilizado: Decimal
