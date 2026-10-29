from pydantic import BaseModel, EmailStr, Field, field_validator

LIMITE_BYTES_SENHA = 72


def _validar_bytes_senha(senha: str) -> str:
    if len(senha.encode()) > LIMITE_BYTES_SENHA:
        raise ValueError("A senha é longa demais")
    return senha


class SolicitacaoCadastro(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)

    _senha_em_bytes = field_validator("senha")(_validar_bytes_senha)


class SolicitacaoEntrada(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=72)

    _senha_em_bytes = field_validator("senha")(_validar_bytes_senha)


class RespostaUsuario(BaseModel):
    id_usuario: int
    nome: str
    email: EmailStr
