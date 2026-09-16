from fastapi import APIRouter, status

from app.controllers.auth_controller import login, me, register
from app.models.auth_model import LoginResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["autenticacao"])

router.add_api_route(
    "/register",
    register,
    methods=["POST"],
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
router.add_api_route(
    "/login",
    login,
    methods=["POST"],
    response_model=LoginResponse,
)
router.add_api_route("/me", me, methods=["GET"], response_model=UserResponse)
