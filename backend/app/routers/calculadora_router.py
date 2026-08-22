"""
Rotas da API para a Calculadora de Investimentos.
"""
from fastapi import APIRouter, status
from app.controllers.calculadora_controller import CalculadoraController
from app.views.calculadora_view import (
    SimulacaoRequestView,
    SimulacaoResponseView,
)

router = APIRouter(prefix="/calculadora", tags=["Calculadora de Investimentos"])

@router.post(
    "/simular",
    response_model=SimulacaoResponseView,
    status_code=status.HTTP_200_OK,
    summary="Simular rendimento de investimento",
    description="Calcula a evolução patrimonial com juros compostos e aportes mensais.",
)
def simular_investimento(payload: SimulacaoRequestView) -> SimulacaoResponseView:
    """Endpoint que delega para o Controller da Calculadora."""
    return CalculadoraController.simular(payload)
