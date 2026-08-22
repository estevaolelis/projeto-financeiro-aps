"""
Serviço de consulta e gerenciamento de Dúvidas e FAQs.
"""
from typing import List, Optional
from app.models.faq_model import FAQItem

class FAQService:
    """Regras de negócio para consulta de perguntas frequentes."""

    _FAQS: List[FAQItem] = [
        FAQItem(
            id=1,
            categoria="Reserva de Emergência",
            pergunta="O que é Reserva de Emergência e quanto devo guardar?",
            resposta="A reserva de emergência é um montante financeiro destinado a cobrir imprevistos (como despesas médicas, demissão ou consertos urgentes). O recomendado é acumular de 6 a 12 meses do seu custo de vida mensal em aplicações com alta liquidez diária e baixo risco (como Tesouro Selic ou CDB 100% CDI)."
        ),
        FAQItem(
            id=2,
            categoria="Renda Fixa",
            pergunta="O que é a taxa Selic e o CDI?",
            resposta="A taxa Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central (Copom). O CDI (Certificado de Depósito Interbancário) é uma taxa que acompanha de perto a Selic e serve como principal referência de rendimento para investimentos de renda fixa privada, como CDBs e LCIs."
        ),
        FAQItem(
            id=3,
            categoria="Renda Fixa",
            pergunta="O que é a garantia do FGC?",
            resposta="O Fundo Garantidor de Créditos (FGC) é uma instituição que protege o dinheiro do investidor em até R$ 250.000 por CPF/instituição financeira (com teto global de R$ 1 milhão a cada 4 anos) em produtos como Poupança, CDBs, LCIs e LCAs caso o banco emissor quebre."
        ),
        FAQItem(
            id=4,
            categoria="Renda Variável",
            pergunta="Qual a diferença entre Ações e Fundos Imobiliários (FIIs)?",
            resposta="Ações representam frações do capital social de empresas, proporcionando valorização de capital e dividendos. FIIs reúnem recursos para investir no mercado imobiliário (shoppings, galpões logísticos, escritórios) e distribuem mensalmente a maior parte dos rendimentos de aluguéis aos cotistas."
        ),
        FAQItem(
            id=5,
            categoria="Planejamento Financeiro",
            pergunta="Como funciona a regra orçamentária 50/30/20?",
            resposta="É uma metodologia simples de divisão da renda líquida mensal: 50% para necessidades essenciais (moradia, alimentação, saúde), 30% para desejos pessoais e estilo de vida (lazer, compras) e 20% para investimentos e quitação de dívidas."
        ),
        FAQItem(
            id=6,
            categoria="Impostos",
            pergunta="Como funciona a tabela regressiva de Imposto de Renda em Renda Fixa?",
            resposta="O IR incide apenas sobre os rendimentos de acordo com o tempo da aplicação: até 180 dias (22,5%), de 181 a 360 dias (20%), de 361 a 720 dias (17,5%) e acima de 720 dias (15%). Investimentos como LCI, LCA e debêntures incentivadas são isentos para pessoas físicas."
        ),
    ]

    @classmethod
    def listar_faqs(cls, categoria: Optional[str] = None, busca: Optional[str] = None) -> List[FAQItem]:
        """Filtra e retorna as perguntas frequentes."""
        itens = cls._FAQS

        if categoria:
            itens = [item for item in itens if item.categoria.lower() == categoria.lower()]

        if busca:
            termo = busca.lower()
            itens = [
                item for item in itens
                if termo in item.pergunta.lower() or termo in item.resposta.lower()
            ]

        return itens

    @classmethod
    def obter_categorias(cls) -> List[str]:
        """Retorna as categorias únicas disponíveis."""
        categorias = sorted(list({item.categoria for item in cls._FAQS}))
        return categorias
