"""
Serviço de lógica de negócios e matemática financeira para a Calculadora de Investimentos.
"""
import math
from app.models.calculadora_model import (
    ParametrosSimulacao,
    PontoEvolucaoMensal,
    ResultadoSimulacao,
)

class CalculadoraService:
    """Implementa as regras de cálculo financeiro de juros compostos."""

    @staticmethod
    def calcular_taxa_mensal(taxa_anual_percentual: float) -> float:
        """
        Converte taxa de juros anual percentual em taxa mensal efetiva equivalente.
        Fórmula: i_mensal = (1 + i_anual)^(1/12) - 1
        """
        taxa_anual_decimal = taxa_anual_percentual / 100.0
        taxa_mensal = math.pow(1 + taxa_anual_decimal, 1.0 / 12.0) - 1.0
        return taxa_mensal

    @classmethod
    def simular_investimento(cls, params: ParametrosSimulacao) -> ResultadoSimulacao:
        """
        Executa a simulação completa de juros compostos com aportes mensais.
        """
        taxa_mensal = cls.calcular_taxa_mensal(params.taxa_juros_anual)
        
        saldo_atual = params.valor_inicial
        total_investido = params.valor_inicial
        evolucao = []

        for mes in range(1, params.prazo_meses + 1):
            # Rendimento do mês sobre o saldo anterior
            rendimento_mes = saldo_atual * taxa_mensal
            saldo_atual += rendimento_mes + params.aporte_mensal
            total_investido += params.aporte_mensal
            
            total_juros = saldo_atual - total_investido
            
            evolucao.append(
                PontoEvolucaoMensal(
                    mes=mes,
                    total_investido=round(total_investido, 2),
                    total_juros=round(max(0.0, total_juros), 2),
                    total_acumulado=round(saldo_atual, 2)
                )
            )

        total_juros_final = round(max(0.0, saldo_atual - total_investido), 2)
        
        return ResultadoSimulacao(
            valor_inicial=round(params.valor_inicial, 2),
            total_investido=round(total_investido, 2),
            total_juros=total_juros_final,
            montante_final=round(saldo_atual, 2),
            prazo_meses=params.prazo_meses,
            taxa_juros_anual=round(params.taxa_juros_anual, 2),
            taxa_juros_mensal=round(taxa_mensal * 100.0, 4),
            evolucao=evolucao
        )
