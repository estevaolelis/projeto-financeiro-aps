"""
Views / Schemas para a Calculadora de Investimentos.
Define o formato de entrada e apresentação JSON de saída.
"""
from typing import List
from pydantic import BaseModel, Field

class SimulacaoRequestView(BaseModel):
    """View de entrada com validação dos parâmetros de simulação."""
    valor_inicial: float = Field(..., ge=0, description="Valor inicial aplicado em R$")
    aporte_mensal: float = Field(0.0, ge=0, description="Valor aportado mensalmente em R$")
    taxa_juros_anual: float = Field(..., gt=0, le=1000, description="Taxa de juros anual em % (ex: 12.0 para 12%)")
    prazo_meses: int = Field(..., ge=1, le=600, description="Prazo do investimento em meses")

class PontoEvolucaoView(BaseModel):
    """View de apresentação da evolução mensal."""
    mes: int
    total_investido: float
    total_juros: float
    total_acumulado: float

class SimulacaoResponseView(BaseModel):
    """View de apresentação da resposta da simulação consolidada."""
    valor_inicial: float
    total_investido: float
    total_juros: float
    montante_final: float
    prazo_meses: int
    taxa_juros_anual: float
    taxa_juros_mensal: float
    evolucao: List[PontoEvolucaoView]
