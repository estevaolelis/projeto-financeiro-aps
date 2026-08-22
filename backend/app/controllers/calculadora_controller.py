"""
Controller para a Calculadora de Investimentos.
Orquestra o recebimento dos dados da View de entrada, aciona o Service/Model
e entrega a View de resposta formatada.
"""
from app.models.calculadora_model import ParametrosSimulacao
from app.services.calculadora_service import CalculadoraService
from app.views.calculadora_view import (
    SimulacaoRequestView,
    PontoEvolucaoView,
    SimulacaoResponseView,
)

class CalculadoraController:
    """Controlador das ações da calculadora financeira."""

    @classmethod
    def simular(cls, payload: SimulacaoRequestView) -> SimulacaoResponseView:
        """
        Recebe a View de requisição, converte para o Model de Parâmetros,
        chama o Serviço de cálculo e converte o Resultado para a View de resposta.
        """
        # 1. Converte View -> Model de Domínio
        parametros = ParametrosSimulacao(
            valor_inicial=payload.valor_inicial,
            aporte_mensal=payload.aporte_mensal,
            taxa_juros_anual=payload.taxa_juros_anual,
            prazo_meses=payload.prazo_meses,
        )

        # 2. Executa a lógica de negócio via Service
        resultado = CalculadoraService.simular_investimento(parametros)

        # 3. Mapeia Model -> View de Apresentação (JSON)
        evolucao_views = [
            PontoEvolucaoView(
                mes=ponto.mes,
                total_investido=ponto.total_investido,
                total_juros=ponto.total_juros,
                total_acumulado=ponto.total_acumulado,
            )
            for ponto in resultado.evolucao
        ]

        return SimulacaoResponseView(
            valor_inicial=resultado.valor_inicial,
            total_investido=resultado.total_investido,
            total_juros=resultado.total_juros,
            montante_final=resultado.montante_final,
            prazo_meses=resultado.prazo_meses,
            taxa_juros_anual=resultado.taxa_juros_anual,
            taxa_juros_mensal=resultado.taxa_juros_mensal,
            evolucao=evolucao_views,
        )
