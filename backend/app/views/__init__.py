"""
Módulo de Views (Schemas Pydantic de apresentação e validação de dados em JSON).
"""
from app.views.calculadora_view import (
    SimulacaoRequestView,
    PontoEvolucaoView,
    SimulacaoResponseView,
)
from app.views.perfil_view import (
    OpcaoView,
    PerguntaView,
    QuestionarioResponseView,
    RespostaItemView,
    AvaliacaoPerfilRequestView,
    AlocacaoView,
    ResultadoPerfilResponseView,
)
from app.views.faq_view import (
    FAQItemView,
    FAQListResponseView,
)

__all__ = [
    "SimulacaoRequestView",
    "PontoEvolucaoView",
    "SimulacaoResponseView",
    "OpcaoView",
    "PerguntaView",
    "QuestionarioResponseView",
    "RespostaItemView",
    "AvaliacaoPerfilRequestView",
    "AlocacaoView",
    "ResultadoPerfilResponseView",
    "FAQItemView",
    "FAQListResponseView",
]
