from fastapi import APIRouter

roteador = APIRouter(prefix="/api", tags=["exemplo"])


@roteador.get("/exemplo")
def obter_exemplo():
    return {"mensagem": "Rota de exemplo no padrão MVC"}
