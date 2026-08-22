"""
Views / Schemas para Perguntas Frequentes (FAQ).
"""
from typing import List, Optional
from pydantic import BaseModel

class FAQItemView(BaseModel):
    """View de representação de um item de FAQ."""
    id: int
    pergunta: str
    resposta: str
    categoria: str

class FAQListResponseView(BaseModel):
    """View com a listagem de FAQs e categorias disponíveis."""
    total: int
    categorias: List[str]
    items: List[FAQItemView]
