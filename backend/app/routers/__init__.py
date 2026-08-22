"""
Módulo de Routers (Definição dos endpoints HTTP que delegam para os Controllers).
"""
from app.routers.api import api_router
from app.routers.calculadora_router import router as calculadora_router
from app.routers.perfil_router import router as perfil_router
from app.routers.faq_router import router as faq_router

__all__ = [
    "api_router",
    "calculadora_router",
    "perfil_router",
    "faq_router",
]
