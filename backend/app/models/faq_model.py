"""
Modelos de domínio para Perguntas Frequentes (FAQ).
"""
from dataclasses import dataclass

@dataclass
class FAQItem:
    """Entidade que representa uma pergunta e resposta frequente."""
    id: int
    pergunta: str
    resposta: str
    categoria: str
