from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from mysql.connector import IntegrityError

from app.config import settings
from app.database import get_connection
from app.models.auth_model import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
)


class EmailAlreadyRegisteredError(Exception):
    """Indica que o e-mail informado já pertence a outro usuário."""


class InvalidCredentialsError(Exception):
    """Indica que as credenciais de acesso não são válidas."""


class InvalidTokenError(Exception):
    """Indica que o token não pode ser usado para autenticação."""


class UserNotFoundError(Exception):
    """Indica que o usuário do token não existe mais."""


def _create_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expiration_minutes
    )
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        settings.jwt_secret,
        algorithm="HS256",
    )


def _to_user_response(row: tuple[object, ...]) -> UserResponse:
    return UserResponse(id_usuario=int(row[0]), nome=str(row[1]), email=str(row[2]))


def register_user(data: RegisterRequest) -> UserResponse:
    nome = data.nome.strip()
    email = data.email.lower()
    password_hash = bcrypt.hashpw(data.senha.encode(), bcrypt.gensalt()).decode()

    try:
        with get_connection() as connection:
            cursor = connection.cursor()
            try:
                cursor.execute(
                    "INSERT INTO usuario (nome, email, senha_hash) VALUES (%s, %s, %s)",
                    (nome, email, password_hash),
                )
                connection.commit()
                user_id = cursor.lastrowid
            finally:
                cursor.close()
    except IntegrityError as error:
        if error.errno == 1062:
            raise EmailAlreadyRegisteredError from error
        raise

    return UserResponse(id_usuario=int(user_id), nome=nome, email=email)


def authenticate_user(data: LoginRequest) -> LoginResponse:
    with get_connection() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute(
                "SELECT id_usuario, nome, email, senha_hash FROM usuario WHERE email = %s",
                (data.email.lower(),),
            )
            row = cursor.fetchone()
        finally:
            cursor.close()

    if row is None or not bcrypt.checkpw(data.senha.encode(), str(row[3]).encode()):
        raise InvalidCredentialsError

    user = _to_user_response(row)
    return LoginResponse(access_token=_create_token(user.id_usuario), user=user)


def get_user_from_token(token: str) -> UserResponse:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as error:
        raise InvalidTokenError from error

    with get_connection() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute(
                "SELECT id_usuario, nome, email FROM usuario WHERE id_usuario = %s",
                (user_id,),
            )
            row = cursor.fetchone()
        finally:
            cursor.close()

    if row is None:
        raise UserNotFoundError
    return _to_user_response(row)
