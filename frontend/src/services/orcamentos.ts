import { requisitarAutenticado } from './http';

export type Orcamento = {
	id_orcamento: number;
	id_categoria: number;
	nome_categoria: string;
	mes: number;
	ano: number;
	valor_limite: string;
	percentual_alerta: string;
	valor_gasto: string;
	valor_restante: string;
	percentual_utilizado: string;
};

export type DadosOrcamento = {
	id_categoria: number;
	mes: number;
	ano: number;
	valor_limite: string;
};

export function listarOrcamentos(mes: number, ano: number) {
	return requisitarAutenticado<Orcamento[]>(`/api/orcamentos?mes=${mes}&ano=${ano}`);
}

export function cadastrarOrcamento(dados: DadosOrcamento) {
	return requisitarAutenticado<Orcamento>('/api/orcamentos', {
		method: 'POST',
		body: JSON.stringify(dados),
	});
}

export function editarOrcamento(id: number, valorLimite: string) {
	return requisitarAutenticado<Orcamento>(`/api/orcamentos/${id}`, {
		method: 'PUT',
		body: JSON.stringify({ valor_limite: valorLimite }),
	});
}

export function excluirOrcamento(id: number) {
	return requisitarAutenticado<void>(`/api/orcamentos/${id}`, { method: 'DELETE' });
}
