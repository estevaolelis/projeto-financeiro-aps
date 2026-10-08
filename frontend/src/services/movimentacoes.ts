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

export function listarMovimentacoes() {
	return requisitarAutenticado<Movimentacao[]>('/api/movimentacoes');
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
