"""
Agregador principal de rotas da API.
"""
from fastapi import APIRouter
from app.routers.calculadora_router import router as calculadora_router
from app.routers.perfil_router import router as perfil_router
from app.routers.faq_router import router as faq_router

api_router = APIRouter()

api_router.include_router(calculadora_router)
api_router.include_router(perfil_router)
api_router.include_router(faq_router)

@api_router.get("/mensagem", tags=["Sistema"])
def get_mensagem():
    """Endpoint de status e verificação de conexão com o backend."""
    return {"texto": "Backend conectado com sucesso ao frontend (Padrão MVC)!"}
