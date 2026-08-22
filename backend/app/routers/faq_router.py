"""
Rotas da API para Perguntas Frequentes (FAQ).
"""
from typing import Optional
from fastapi import APIRouter, Query, status
from app.controllers.faq_controller import FAQController
from app.views.faq_view import FAQListResponseView

router = APIRouter(prefix="/faq", tags=["Dúvidas e FAQ"])

@router.get(
    "",
    response_model=FAQListResponseView,
    status_code=status.HTTP_200_OK,
    summary="Listar dúvidas e respostas frequentes",
    description="Retorna as perguntas com suporte a filtro por categoria e busca textual.",
)
def listar_faqs(
    categoria: Optional[str] = Query(None, description="Filtrar por categoria específica"),
    busca: Optional[str] = Query(None, description="Termo de busca para pergunta ou resposta"),
) -> FAQListResponseView:
    """Endpoint para listagem de FAQs."""
    return FAQController.listar(categoria=categoria, busca=busca)
