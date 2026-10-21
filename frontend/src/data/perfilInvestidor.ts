export type PerfilId = 'CONSERVADOR' | 'MODERADO' | 'ARROJADO';

export type Pergunta = { enunciado: string; opcoes: { texto: string; pontos: number }[] };

export const PERGUNTAS: Pergunta[] = [
	{
		enunciado: 'Por quanto tempo você pretende manter seu dinheiro investido?',
		opcoes: [
			{ texto: 'Menos de 1 ano', pontos: 1 },
			{ texto: 'De 1 a 3 anos', pontos: 2 },
			{ texto: 'De 3 a 5 anos', pontos: 3 },
			{ texto: 'Mais de 5 anos', pontos: 4 },
		],
	},
	{
		enunciado: 'Qual é o seu principal objetivo ao investir?',
		opcoes: [
			{ texto: 'Preservar o que tenho, sem sustos', pontos: 1 },
			{ texto: 'Ganhar um pouco acima da inflação', pontos: 2 },
			{ texto: 'Fazer o patrimônio crescer de forma consistente', pontos: 3 },
			{ texto: 'Maximizar o retorno, mesmo com muita oscilação', pontos: 4 },
		],
	},
	{
		enunciado: 'Seu investimento de R$ 10.000 caiu para R$ 8.500 em um mês. O que você faz?',
		opcoes: [
			{ texto: 'Vendo tudo para não perder mais', pontos: 1 },
			{ texto: 'Vendo uma parte para reduzir o risco', pontos: 2 },
			{ texto: 'Mantenho e aguardo a recuperação', pontos: 3 },
			{ texto: 'Aproveito para comprar mais', pontos: 4 },
		],
	},
	{
		enunciado: 'Qual é a sua experiência com investimentos?',
		opcoes: [
			{ texto: 'Nenhuma, só uso poupança ou conta remunerada', pontos: 1 },
			{ texto: 'Já investi em renda fixa (CDB, Tesouro)', pontos: 2 },
			{ texto: 'Invisto em renda fixa e fundos', pontos: 3 },
			{ texto: 'Invisto também em ações e outros ativos de risco', pontos: 4 },
		],
	},
	{
		enunciado: 'Que parte da sua renda mensal sobra, em média, depois dos gastos?',
		opcoes: [
			{ texto: 'Quase nada', pontos: 1 },
			{ texto: 'Até 10%', pontos: 2 },
			{ texto: 'De 10% a 25%', pontos: 3 },
			{ texto: 'Mais de 25%', pontos: 4 },
		],
	},
	{
		enunciado: 'Você já tem uma reserva de emergência (de 3 a 6 meses de gastos)?',
		opcoes: [
			{ texto: 'Não tenho nenhuma reserva', pontos: 1 },
			{ texto: 'Tenho menos de 3 meses', pontos: 2 },
			{ texto: 'Tenho de 3 a 6 meses', pontos: 3 },
			{ texto: 'Tenho mais de 6 meses', pontos: 4 },
		],
	},
	{
		enunciado: 'Qual perda máxima, em um ano, você aceitaria para ter chance de ganhos maiores?',
		opcoes: [
			{ texto: 'Nenhuma perda', pontos: 1 },
			{ texto: 'Até 5%', pontos: 2 },
			{ texto: 'Até 15%', pontos: 3 },
			{ texto: 'Mais de 15%', pontos: 4 },
		],
	},
];

export type Perfil = {
	id: PerfilId;
	nome: string;
	cor: string;
	resumo: string;
	caracteristicas: string[];
	alocacao: { classe: string; percentual: number; cor: string }[];
	produtos: string[];
};

export const PERFIS: Record<PerfilId, Perfil> = {
	CONSERVADOR: {
		id: 'CONSERVADOR',
		nome: 'Conservador',
		cor: '#3987e5',
		resumo: 'Você prioriza segurança e previsibilidade. Prefere abrir mão de rentabilidade para não ver o patrimônio oscilar.',
		caracteristicas: ['Baixa tolerância a perdas', 'Foco em liquidez e proteção do capital', 'Horizonte de curto a médio prazo'],
		alocacao: [
			{ classe: 'Renda fixa', percentual: 85, cor: '#3987e5' },
			{ classe: 'Multimercado / fundos', percentual: 10, cor: '#c98500' },
			{ classe: 'Renda variável', percentual: 5, cor: '#d95926' },
		],
		produtos: ['Tesouro Selic', 'CDB com liquidez diária', 'LCI e LCA', 'Fundos DI'],
	},
	MODERADO: {
		id: 'MODERADO',
		nome: 'Moderado',
		cor: '#199e70',
		resumo: 'Você aceita alguma oscilação em troca de um retorno maior no longo prazo, mantendo a maior parte em segurança.',
		caracteristicas: ['Tolera perdas temporárias', 'Busca equilíbrio entre segurança e rentabilidade', 'Horizonte de médio a longo prazo'],
		alocacao: [
			{ classe: 'Renda fixa', percentual: 60, cor: '#3987e5' },
			{ classe: 'Multimercado / fundos', percentual: 20, cor: '#c98500' },
			{ classe: 'Renda variável', percentual: 20, cor: '#d95926' },
		],
		produtos: ['Tesouro IPCA+', 'CDBs de prazos variados', 'Fundos multimercado', 'ETFs e fundos de ações'],
	},
	ARROJADO: {
		id: 'ARROJADO',
		nome: 'Arrojado',
		cor: '#d95926',
		resumo: 'Você busca maximizar o crescimento do patrimônio e está confortável com oscilações fortes no caminho.',
		caracteristicas: ['Alta tolerância a risco', 'Foco em crescimento no longo prazo', 'Horizonte superior a 5 anos'],
		alocacao: [
			{ classe: 'Renda fixa', percentual: 30, cor: '#3987e5' },
			{ classe: 'Multimercado / fundos', percentual: 20, cor: '#c98500' },
			{ classe: 'Renda variável', percentual: 50, cor: '#d95926' },
		],
		produtos: ['Ações e ETFs de ações', 'Fundos de ações', 'Fundos imobiliários', 'Parte da carteira em renda fixa como proteção'],
	},
};

export function classificar(pontos: number): PerfilId {
	if (pontos <= 14) return 'CONSERVADOR';
	if (pontos <= 21) return 'MODERADO';
	return 'ARROJADO';
}
