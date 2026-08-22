"""
Ponto de entrada da aplicação FastAPI (Padrão MVC).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend estruturado no padrão MVC para o projeto de Orientação e Educação Financeira.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração de CORS para comunicação com o Frontend (Vite / React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas da API centralizadas
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Sistema"])
def root():
    """Endpoint raiz com informações da API."""
    return {
        "projeto": settings.PROJECT_NAME,
        "versao": settings.VERSION,
        "documentacao": "/docs",
        "padrao_arquitetural": "MVC (Model-View-Controller)",
    }