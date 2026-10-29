import { requisitar } from './http';

export type Usuario = {
	id_usuario: number;
	nome: string;
	email: string;
};

export function cadastrar(nome: string, email: string, senha: string) {
	return requisitar<Usuario>('/api/autenticacao/cadastro', {
		method: 'POST',
		body: JSON.stringify({ nome, email, senha }),
	});
}

export function entrar(email: string, senha: string) {
	return requisitar<Usuario>('/api/autenticacao/entrar', {
		method: 'POST',
		body: JSON.stringify({ email, senha }),
	});
}

export function obterUsuarioAtual() {
	return requisitar<Usuario>('/api/autenticacao/eu');
}

export function sair() {
	return requisitar<void>('/api/autenticacao/sair', { method: 'POST' });
}
