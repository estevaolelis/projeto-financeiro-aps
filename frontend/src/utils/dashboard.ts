import type { Movimentacao } from '../services/movimentacoes';

export type Periodo = { inicio: string; fim: string };
export type PresetPeriodo = 'mes' | '3m' | '6m' | '12m' | 'ano' | 'custom';

export const PRESETS: { valor: Exclude<PresetPeriodo, 'custom'>; rotulo: string }[] = [
	{ valor: 'mes', rotulo: 'Este mês' },
	{ valor: '3m', rotulo: '3 meses' },
	{ valor: '6m', rotulo: '6 meses' },
	{ valor: '12m', rotulo: '12 meses' },
	{ valor: 'ano', rotulo: 'Este ano' },
];

const CORES_CATEGORIA = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
export const COR_OUTROS = '#6b7280';

const formatar = (data: Date) => data.toLocaleDateString('sv-SE');
const analisar = (texto: string) => {
	const [ano, mes, dia] = texto.split('-').map(Number);
	return new Date(ano, mes - 1, dia);
};

export function periodoDoPreset(preset: Exclude<PresetPeriodo, 'custom'>): Periodo {
	const agora = new Date();
	const meses = { mes: 1, '3m': 3, '6m': 6, '12m': 12, ano: 0 }[preset];
	if (preset === 'ano') return { inicio: `${agora.getFullYear()}-01-01`, fim: `${agora.getFullYear()}-12-31` };
	return {
		inicio: formatar(new Date(agora.getFullYear(), agora.getMonth() - (meses - 1), 1)),
		fim: formatar(new Date(agora.getFullYear(), agora.getMonth() + 1, 0)),
	};
}

const diasEntre = (inicio: string, fim: string) =>
	Math.round((analisar(fim).getTime() - analisar(inicio).getTime()) / 86_400_000) + 1;

/** Período imediatamente anterior, de mesmo tamanho (alinhado a meses quando o atual for). */
export function periodoAnterior({ inicio, fim }: Periodo): Periodo {
	const ini = analisar(inicio);
	const f = analisar(fim);
	const fechaMes = f.getDate() === new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate();
	if (ini.getDate() === 1 && fechaMes) {
		const meses = (f.getFullYear() - ini.getFullYear()) * 12 + f.getMonth() - ini.getMonth() + 1;
		return {
			inicio: formatar(new Date(ini.getFullYear(), ini.getMonth() - meses, 1)),
			fim: formatar(new Date(ini.getFullYear(), ini.getMonth(), 0)),
		};
	}
	const dias = diasEntre(inicio, fim);
	return {
		inicio: formatar(new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() - dias)),
		fim: formatar(new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() - 1)),
	};
}

export const noPeriodo = (movimentacoes: Movimentacao[], { inicio, fim }: Periodo) =>
	movimentacoes.filter((item) => item.data_movimentacao >= inicio && item.data_movimentacao <= fim);

const somar = (itens: Movimentacao[], tipo: Movimentacao['tipo']) =>
	itens.filter((item) => item.tipo === tipo).reduce((soma, item) => soma + Number(item.valor), 0);

export function totais(itens: Movimentacao[]) {
	const receitas = somar(itens, 'RECEITA');
	const despesas = somar(itens, 'DESPESA');
	const fixas = itens.filter((item) => item.tipo === 'DESPESA' && item.natureza === 'FIXA').reduce((soma, item) => soma + Number(item.valor), 0);
	return {
		receitas,
		despesas,
		saldo: receitas - despesas,
		fixas,
		variaveis: despesas - fixas,
		taxaEconomia: receitas > 0 ? ((receitas - despesas) / receitas) * 100 : null,
	};
}

/** Variação percentual; null quando não há base de comparação. */
export const variacao = (atual: number, anterior: number) =>
	anterior === 0 ? null : ((atual - anterior) / Math.abs(anterior)) * 100;

export function serieTemporal(movimentacoes: Movimentacao[], periodo: Periodo) {
	const diario = diasEntre(periodo.inicio, periodo.fim) <= 31;
	const chaves: string[] = [];
	const rotulos: string[] = [];
	const cursor = analisar(periodo.inicio);
	const fim = analisar(periodo.fim);
	while (cursor <= fim) {
		const texto = formatar(cursor);
		chaves.push(diario ? texto : texto.slice(0, 7));
		rotulos.push(diario
			? String(cursor.getDate())
			: cursor.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').replace(' de ', '/'));
		if (diario) cursor.setDate(cursor.getDate() + 1);
		else cursor.setMonth(cursor.getMonth() + 1, 1);
	}
	const receitas = chaves.map(() => 0);
	const despesas = chaves.map(() => 0);
	noPeriodo(movimentacoes, periodo).forEach((item) => {
		const indice = chaves.indexOf(diario ? item.data_movimentacao : item.data_movimentacao.slice(0, 7));
		if (indice < 0) return;
		(item.tipo === 'RECEITA' ? receitas : despesas)[indice] += Number(item.valor);
	});
	let acumulado = movimentacoes
		.filter((item) => item.data_movimentacao < periodo.inicio)
		.reduce((soma, item) => soma + (item.tipo === 'RECEITA' ? 1 : -1) * Number(item.valor), 0);
	const saldo = receitas.map((valor, indice) => (acumulado += valor - despesas[indice]));
	return { rotulos, receitas, despesas, saldo, diario };
}

/** Cor por categoria: fixa pelo nome (ordem alfabética entre todas as despesas), nunca pelo ranking do período. */
export function coresDasCategorias(movimentacoes: Movimentacao[]) {
	const nomes = [...new Set(movimentacoes.filter((item) => item.tipo === 'DESPESA').map((item) => item.nome_categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
	return new Map(nomes.map((nome, indice) => [nome, CORES_CATEGORIA[indice] ?? COR_OUTROS]));
}

export function despesasPorCategoria(itens: Movimentacao[], cores: Map<string, string>) {
	const totaisPorNome = new Map<string, number>();
	itens
		.filter((item) => item.tipo === 'DESPESA')
		.forEach((item) => totaisPorNome.set(item.nome_categoria, (totaisPorNome.get(item.nome_categoria) ?? 0) + Number(item.valor)));
	const ordenadas = [...totaisPorNome].sort((a, b) => b[1] - a[1]);
	const agrupado = new Map<string, number>();
	ordenadas.forEach(([nome, valor]) => {
		const cor = cores.get(nome) ?? COR_OUTROS;
		const rotulo = cor === COR_OUTROS ? 'Outras' : nome;
		agrupado.set(rotulo, (agrupado.get(rotulo) ?? 0) + valor);
	});
	const total = ordenadas.reduce((soma, [, valor]) => soma + valor, 0);
	return [...agrupado].map(([label, value], id) => ({
		id,
		label,
		value,
		color: label === 'Outras' ? COR_OUTROS : (cores.get(label) ?? COR_OUTROS),
		percentual: total > 0 ? (value / total) * 100 : 0,
	}));
}
