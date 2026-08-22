"""
Módulo de Controllers (Controladores que orquestram requisições, regras e views).
"""
from app.controllers.calculadora_controller import CalculadoraController
from app.controllers.perfil_controller import PerfilController
from app.controllers.faq_controller import FAQController

__all__ = [
    "CalculadoraController",
    "PerfilController",
    "FAQController",
]
