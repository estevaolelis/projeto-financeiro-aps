"""
Controller para o Questionário de Perfil de Investidor.
"""
from app.services.perfil_service import PerfilService
from app.views.perfil_view import (
    OpcaoView,
    PerguntaView,
    QuestionarioResponseView,
    AvaliacaoPerfilRequestView,
    AlocacaoView,
    ResultadoPerfilResponseView,
)

class PerfilController:
    """Controlador das ações do Perfil de Investidor."""

    @classmethod
    def obter_questionario(cls) -> QuestionarioResponseView:
        """Busca as perguntas no Model/Service e formata para a View de resposta."""
        perguntas_model = PerfilService.obter_perguntas()
        
        perguntas_view = [
            PerguntaView(
                id=p.id,
                titulo=p.titulo,
                descricao=p.descricao,
                opcoes=[OpcaoView(id=op.id, texto=op.texto) for op in p.opcoes],
            )
            for p in perguntas_model
        ]

        return QuestionarioResponseView(perguntas=perguntas_view)

    @classmethod
    def avaliar_respostas(cls, payload: AvaliacaoPerfilRequestView) -> ResultadoPerfilResponseView:
        """Recebe as respostas do usuário, processa no Service e formata o resultado."""
        respostas_dict = [r.model_dump() for r in payload.respostas]
        perfil_model, pontuacao_total = PerfilService.avaliar_respostas(respostas_dict)

        alocacao_view = AlocacaoView(
            renda_fixa=perfil_model.alocacao.renda_fixa,
            multimercado=perfil_model.alocacao.multimercado,
            renda_variavel=perfil_model.alocacao.renda_variavel,
            internacional=perfil_model.alocacao.internacional,
        )

        return ResultadoPerfilResponseView(
            perfil=perfil_model.tipo,
            titulo=perfil_model.titulo,
            descricao=perfil_model.descricao,
            pontuacao_total=pontuacao_total,
            alocacao_recomendada=alocacao_view,
            produtos_sugeridos=perfil_model.produtos_sugeridos,
        )
