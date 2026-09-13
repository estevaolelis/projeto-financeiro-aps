from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.database import get_connection

router = APIRouter(prefix="/api/auth", tags=["autenticacao"])
bearer_scheme = HTTPBearer(auto_error=False)


class RegisterRequest(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=72)


class UserResponse(BaseModel):
    id_usuario: int
    nome: str
    email: EmailStr


def _create_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expiration_minutes
    )
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        settings.jwt_secret,
        algorithm="HS256",
    )


def _user_response(row: tuple[object, ...]) -> UserResponse:
    return UserResponse(id_usuario=int(row[0]), nome=str(row[1]), email=str(row[2]))


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserResponse:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ausente")
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        ) from error

    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id_usuario, nome, email FROM usuario WHERE id_usuario = %s",
            (user_id,),
        )
        row = cursor.fetchone()
        cursor.close()
    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return _user_response(row)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest) -> UserResponse:
    password_hash = bcrypt.hashpw(data.senha.encode(), bcrypt.gensalt()).decode()
    try:
        with get_connection() as connection:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO usuario (nome, email, senha_hash) VALUES (%s, %s, %s)",
                (data.nome.strip(), data.email.lower(), password_hash),
            )
            connection.commit()
            user_id = cursor.lastrowid
            cursor.close()
    except Exception as error:
        if "Duplicate entry" in str(error):
            raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado") from error
        raise
    return UserResponse(id_usuario=int(user_id), nome=data.nome.strip(), email=data.email.lower())


@router.post("/login")
def login(data: LoginRequest) -> dict[str, object]:
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id_usuario, nome, email, senha_hash FROM usuario WHERE email = %s",
            (data.email.lower(),),
        )
        row = cursor.fetchone()
        cursor.close()
    if row is None or not bcrypt.checkpw(data.senha.encode(), str(row[3]).encode()):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
    user = _user_response(row)
    return {"access_token": _create_token(user.id_usuario), "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user