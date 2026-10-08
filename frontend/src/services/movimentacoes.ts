import { requisitarAutenticado } from './http';
import type { TipoMovimentacao } from './categorias';

export type NaturezaMovimentacao = 'FIXA' | 'VARIAVEL';

export type DadosMovimentacao = {
	id_categoria: number;
	descricao: string;
	tipo: TipoMovimentacao;
	natureza: NaturezaMovimentacao;
	valor: string;
	data_movimentacao: string;
	observacao: string | null;
};

export type Movimentacao = DadosMovimentacao & {
	id_movimentacao: number;
	nome_categoria: string;
};

export type FiltrosMovimentacao = {
	tipo: TipoMovimentacao | '';
	id_categoria: number | '';
	data_inicio: string;
	data_fim: string;
};

export function listarMovimentacoes(filtros: FiltrosMovimentacao) {
	const consulta = new URLSearchParams();
	Object.entries(filtros).forEach(([campo, valor]) => {
		if (valor !== '') consulta.set(campo, String(valor));
	});
	return requisitarAutenticado<Movimentacao[]>(`/api/movimentacoes?${consulta}`);
}

export function cadastrarMovimentacao(dados: DadosMovimentacao) {
	return requisitarAutenticado<Movimentacao>('/api/movimentacoes', {
		method: 'POST',
		body: JSON.stringify(dados),
	});
}

export function editarMovimentacao(id: number, dados: DadosMovimentacao) {
	return requisitarAutenticado<Movimentacao>(`/api/movimentacoes/${id}`, {
		method: 'PUT',
		body: JSON.stringify(dados),
	});
}

export function excluirMovimentacao(id: number) {
	return requisitarAutenticado<void>(`/api/movimentacoes/${id}`, { method: 'DELETE' });
}
