"""
Serviço de lógica de questionário e classificação de Perfil de Investidor (Suitability).
"""
from typing import List, Dict, Tuple, Optional
from app.models.perfil_model import (
    OpcaoPergunta,
    PerguntaQuestionario,
    AlocacaoRecomendada,
    PerfilInvestidor,
)

class PerfilService:
    """Regras de negócio para avaliação de perfil de investidor."""

    _PERGUNTAS: List[PerguntaQuestionario] = [
        PerguntaQuestionario(
            id=1,
            titulo="Por quanto tempo você pretende deixar seu dinheiro investido?",
            descricao="O horizonte de tempo define quais classes de ativos são mais adequadas ao seu objetivo.",
            opcoes=[
                OpcaoPergunta(id="a", texto="Menos de 1 ano (Curto prazo)", pontos=1),
                OpcaoPergunta(id="b", texto="De 1 a 3 anos (Médio prazo)", pontos=2),
                OpcaoPergunta(id="c", texto="De 3 a 5 anos (Longo prazo)", pontos=3),
                OpcaoPergunta(id="d", texto="Mais de 5 anos (Aposentadoria / Liberdade Financeira)", pontos=4),
            ]
        ),
        PerguntaQuestionario(
            id=2,
            titulo="Qual é o seu principal objetivo ao investir?",
            descricao="Seus objetivos guiam a priorização entre segurança, liquidez e rentabilidade.",
            opcoes=[
                OpcaoPergunta(id="a", texto="Preservar meu patrimônio sem correr riscos de perdas", pontos=1),
                OpcaoPergunta(id="b", texto="Obter rentabilidade um pouco acima da poupança/inflação", pontos=2),
                OpcaoPergunta(id="c", texto="Aumentar meu patrimônio aceitando oscilações moderadas", pontos=3),
                OpcaoPergunta(id="d", texto="Maximizar o retorno no longo prazo, mesmo com alta volatilidade", pontos=4),
            ]
        ),
        PerguntaQuestionario(
            id=3,
            titulo="Como você reage se seus investimentos caírem 10% em um mês?",
            descricao="Sua tolerância psicológica à volatilidade é fundamental para definir sua carteira.",
            opcoes=[
                OpcaoPergunta(id="a", texto="Entro em pânico e resgato tudo imediatamente", pontos=1),
                OpcaoPergunta(id="b", texto="Fico desconfortável e penso em migrar para opções mais conservadoras", pontos=2),
                OpcaoPergunta(id="c", texto="Mantenho a estratégia entendendo que oscilações fazem parte do mercado", pontos=3),
                OpcaoPergunta(id="d", texto="Aproveito o momento de queda para investir mais a preços descontados", pontos=4),
            ]
        ),
        PerguntaQuestionario(
            id=4,
            titulo="Qual é o seu nível de familiaridade com o mercado financeiro?",
            descricao="Conhecimento sobre os produtos e seus riscos.",
            opcoes=[
                OpcaoPergunta(id="a", texto="Nenhum ou apenas conheço a Poupança", pontos=1),
                OpcaoPergunta(id="b", texto="Conheço Renda Fixa (Tesouro Direto, CDBs, LCIs)", pontos=2),
                OpcaoPergunta(id="c", texto="Conheço e já investi em Fundos Imobiliários (FIIs) e Ações", pontos=3),
                OpcaoPergunta(id="d", texto="Domino renda variável, derivativos e ativos globais", pontos=4),
            ]
        ),
        PerguntaQuestionario(
            id=5,
            titulo="Qual porcentagem da sua renda mensal você consegue poupar?",
            descricao="Capacidade de aporte e reserva de emergência.",
            opcoes=[
                OpcaoPergunta(id="a", texto="Não consigo poupar regularmente ou até 5%", pontos=1),
                OpcaoPergunta(id="b", texto="Entre 5% e 15%", pontos=2),
                OpcaoPergunta(id="c", texto="Entre 15% e 30%", pontos=3),
                OpcaoPergunta(id="d", texto="Mais de 30%", pontos=4),
            ]
        ),
    ]

    _PERFIS: List[PerfilInvestidor] = [
        PerfilInvestidor(
            tipo="Conservador",
            titulo="Investidor Conservador",
            descricao="Prioriza a segurança e liquidez do seu patrimônio. Prefere retornos previsíveis e busca minimizar riscos de perdas.",
            pontuacao_minima=5,
            pontuacao_maxima=9,
            alocacao=AlocacaoRecomendada(
                renda_fixa=85.0,
                multimercado=10.0,
                renda_variavel=5.0,
                internacional=0.0
            ),
            produtos_sugeridos=[
                "Tesouro Selic e Tesouro IPCA+",
                "CDBs e LCIs/LCAs com garantia do FGC",
                "Fundos DI de taxa zero",
            ]
        ),
        PerfilInvestidor(
            tipo="Moderado",
            titulo="Investidor Moderado",
            descricao="Busca equilíbrio entre segurança e rentabilidade. Aceita correr riscos calculados em parte da carteira para obter retornos superiores.",
            pontuacao_minima=10,
            pontuacao_maxima=15,
            alocacao=AlocacaoRecomendada(
                renda_fixa=50.0,
                multimercado=25.0,
                renda_variavel=20.0,
                internacional=5.0
            ),
            produtos_sugeridos=[
                "Tesouro IPCA+ de longo prazo",
                "Fundos Imobiliários (FIIs)",
                "Fundos Multimercado balanceados",
                "ETFs de índices amplos (ex: BOVA11)",
            ]
        ),
        PerfilInvestidor(
            tipo="Arrojado",
            titulo="Investidor Arrojado (Agressivo)",
            descricao="Focado em potencializar a rentabilidade no longo prazo. Tem alta tolerância à volatilidade de mercado e experiência com ativos de risco.",
            pontuacao_minima=16,
            pontuacao_maxima=20,
            alocacao=AlocacaoRecomendada(
                renda_fixa=20.0,
                multimercado=15.0,
                renda_variavel=50.0,
                internacional=15.0
            ),
            produtos_sugeridos=[
                "Ações individuais com foco em crescimento e dividendos",
                "Fundos Imobiliários (FIIs e FI-Infra)",
                "ETFs e BDRs de exposição global (ex: IVVB11)",
                "Fundos de Ações e Criptoativos (com moderação)",
            ]
        ),
    ]

    @classmethod
    def obter_perguntas(cls) -> List[PerguntaQuestionario]:
        """Retorna a lista completa de perguntas do questionário."""
        return cls._PERGUNTAS

    @classmethod
    def avaliar_respostas(cls, respostas: List[Dict[str, any]]) -> Tuple[PerfilInvestidor, int]:
        """
        Calcula a pontuação total a partir das respostas do usuário
        e identifica o perfil correspondente.
        """
        pontuacao_total = 0
        mapa_perguntas = {p.id: {op.id: op.pontos for op in p.opcoes} for p in cls._PERGUNTAS}

        for item in respostas:
            p_id = item.get("pergunta_id")
            op_id = item.get("opcao_id")
            
            if p_id in mapa_perguntas and op_id in mapa_perguntas[p_id]:
                pontuacao_total += mapa_perguntas[p_id][op_id]
            else:
                # Pontuação padrão caso a opção não seja encontrada
                pontuacao_total += 1

        # Classifica com base nas faixas
        perfil_selecionado = cls._PERFIS[0]  # Padrão: Conservador
        for perfil in cls._PERFIS:
            if perfil.pontuacao_minima <= pontuacao_total <= perfil.pontuacao_maxima:
                perfil_selecionado = perfil
                break
        else:
            # Caso ultrapasse o teto
            if pontuacao_total > 15:
                perfil_selecionado = cls._PERFIS[-1]

        return perfil_selecionado, pontuacao_total
