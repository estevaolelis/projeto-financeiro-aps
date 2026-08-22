"""
Controller para Dúvidas e FAQs.
"""
from typing import Optional
from app.services.faq_service import FAQService
from app.views.faq_view import (
    FAQItemView,
    FAQListResponseView,
)

class FAQController:
    """Controlador para endpoints de FAQ."""

    @classmethod
    def listar(cls, categoria: Optional[str] = None, busca: Optional[str] = None) -> FAQListResponseView:
        """Obtém os FAQs filtrados pelo Service e monta a View de resposta."""
        itens_model = FAQService.listar_faqs(categoria=categoria, busca=busca)
        categorias = FAQService.obter_categorias()

        itens_view = [
            FAQItemView(
                id=item.id,
                pergunta=item.pergunta,
                resposta=item.resposta,
                categoria=item.categoria,
            )
            for item in itens_model
        ]

        return FAQListResponseView(
            total=len(itens_view),
            categorias=categorias,
            items=itens_view,
        )
