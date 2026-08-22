"""
Módulo de Models (Entidades e estruturas de dados do domínio).
"""
from app.models.calculadora_model import (
    ParametrosSimulacao,
    PontoEvolucaoMensal,
    ResultadoSimulacao,
)
from app.models.perfil_model import (
    OpcaoPergunta,
    PerguntaQuestionario,
    AlocacaoRecomendada,
    PerfilInvestidor,
)
from app.models.faq_model import FAQItem

__all__ = [
    "ParametrosSimulacao",
    "PontoEvolucaoMensal",
    "ResultadoSimulacao",
    "OpcaoPergunta",
    "PerguntaQuestionario",
    "AlocacaoRecomendada",
    "PerfilInvestidor",
    "FAQItem",
]
