"""
Rotas da API para o Perfil de Investidor.
"""
from fastapi import APIRouter, status
from app.controllers.perfil_controller import PerfilController
from app.views.perfil_view import (
    QuestionarioResponseView,
    AvaliacaoPerfilRequestView,
    ResultadoPerfilResponseView,
)

router = APIRouter(prefix="/perfil", tags=["Perfil de Investidor"])

@router.get(
    "/questionario",
    response_model=QuestionarioResponseView,
    status_code=status.HTTP_200_OK,
    summary="Obter questionário de suitability",
    description="Retorna a lista de perguntas e opções para determinação do perfil.",
)
def obter_questionario() -> QuestionarioResponseView:
    """Endpoint para recuperar as perguntas do questionário."""
    return PerfilController.obter_questionario()

@router.post(
    "/avaliar",
    response_model=ResultadoPerfilResponseView,
    status_code=status.HTTP_200_OK,
    summary="Avaliar perfil de investidor",
    description="Processa as respostas do questionário e retorna o perfil e recomendações de alocação.",
)
def avaliar_perfil(payload: AvaliacaoPerfilRequestView) -> ResultadoPerfilResponseView:
    """Endpoint para processar as respostas e classificar o investidor."""
    return PerfilController.avaliar_respostas(payload)
