import { requisitarAutenticado } from './http';

export type TipoMovimentacao = 'RECEITA' | 'DESPESA';

export type Categoria = {
	id_categoria: number;
	nome: string;
	tipo: TipoMovimentacao;
};

export function listarCategorias() {
	return requisitarAutenticado<Categoria[]>('/api/categorias');
}

export function cadastrarCategoria(nome: string, tipo: TipoMovimentacao) {
	return requisitarAutenticado<Categoria>('/api/categorias', {
		method: 'POST',
		body: JSON.stringify({ nome, tipo }),
	});
}
