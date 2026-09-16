from pydantic import BaseModel, EmailStr, Field


class SolicitacaoCadastro(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)


class SolicitacaoEntrada(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=72)


class RespostaUsuario(BaseModel):
    id_usuario: int
    nome: str
    email: EmailStr


class RespostaEntrada(BaseModel):
    token_acesso: str
    tipo_token: str = "bearer"
    usuario: RespostaUsuario
