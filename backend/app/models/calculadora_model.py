"""
Modelos de domínio para a Calculadora de Investimentos.
"""
from dataclasses import dataclass, field
from typing import List

@dataclass
class ParametrosSimulacao:
    """Representa os parâmetros de entrada para uma simulação de juros compostos."""
    valor_inicial: float
    aporte_mensal: float
    taxa_juros_anual: float  # Ex: 12.5 para 12.5% ao ano
    prazo_meses: int

@dataclass
class PontoEvolucaoMensal:
    """Representa a evolução do investimento em um determinado mês."""
    mes: int
    total_investido: float
    total_juros: float
    total_acumulado: float

@dataclass
class ResultadoSimulacao:
    """Representa o resultado consolidado do cálculo de investimento."""
    valor_inicial: float
    total_investido: float
    total_juros: float
    montante_final: float
    prazo_meses: int
    taxa_juros_anual: float
    taxa_juros_mensal: float
    evolucao: List[PontoEvolucaoMensal] = field(default_factory=list)
