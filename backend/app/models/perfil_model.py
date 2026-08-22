"""
Modelos de domínio para o Questionário de Perfil de Investidor (Suitability).
"""
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class OpcaoPergunta:
    """Opção de resposta em uma pergunta do questionário."""
    id: str
    texto: str
    pontos: int

@dataclass
class PerguntaQuestionario:
    """Pergunta do questionário de suitability."""
    id: int
    titulo: str
    descricao: str
    opcoes: List[OpcaoPergunta]

@dataclass
class AlocacaoRecomendada:
    """Sugestão percentual de alocação de carteira."""
    renda_fixa: float
    multimercado: float
    renda_variavel: float
    internacional: float

@dataclass
class PerfilInvestidor:
    """Representa a classificação do investidor e suas recomendações."""
    tipo: str  # 'Conservador', 'Moderado' ou 'Arrojado'
    titulo: str
    descricao: str
    pontuacao_minima: int
    pontuacao_maxima: int
    alocacao: AlocacaoRecomendada
    produtos_sugeridos: List[str]
