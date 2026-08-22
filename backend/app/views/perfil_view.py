"""
Views / Schemas para o Perfil de Investidor.
"""
from typing import List, Dict
from pydantic import BaseModel, Field

class OpcaoView(BaseModel):
    """View para exibição de uma opção de resposta."""
    id: str
    texto: str

class PerguntaView(BaseModel):
    """View para exibição de uma pergunta no questionário."""
    id: int
    titulo: str
    descricao: str
    opcoes: List[OpcaoView]

class QuestionarioResponseView(BaseModel):
    """View contendo a lista de perguntas do questionário."""
    perguntas: List[PerguntaView]

class RespostaItemView(BaseModel):
    """Resposta a uma pergunta específica."""
    pergunta_id: int
    opcao_id: str

class AvaliacaoPerfilRequestView(BaseModel):
    """View de entrada com as respostas do usuário para análise."""
    respostas: List[RespostaItemView] = Field(..., min_length=1, description="Lista de respostas selecionadas")

class AlocacaoView(BaseModel):
    """View com sugestão de alocação de carteira."""
    renda_fixa: float
    multimercado: float
    renda_variavel: float
    internacional: float

class ResultadoPerfilResponseView(BaseModel):
    """View de resposta com o perfil classificado e recomendações."""
    perfil: str
    titulo: str
    descricao: str
    pontuacao_total: int
    alocacao_recomendada: AlocacaoView
    produtos_sugeridos: List[str]
