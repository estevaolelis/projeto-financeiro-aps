from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["exemplo"])


@router.get("/exemplo")
def get_exemplo():
    return {"message": "Rota de exemplo no padrão MVC"}
