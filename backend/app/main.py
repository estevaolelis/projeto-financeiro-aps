from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.exemplo_route import router as exemplo_router
from app.routes.auth_route import router as auth_router

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exemplo_router)
app.include_router(auth_router)


@app.get("/")
def read_root():
    return {"message": f"{settings.app_name} está no ar."}


@app.get("/health")
def health_check():
    return {"status": "ok"}
