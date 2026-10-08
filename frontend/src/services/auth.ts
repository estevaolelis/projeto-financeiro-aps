import { requisitar } from './http';
import type { RespostaAutenticacao, Usuario } from './sessao';

export function cadastrar(nome: string, email: string, senha: string) {
	return requisitar<Usuario>('/api/autenticacao/cadastro', {
		method: 'POST',
		body: JSON.stringify({ nome, email, senha }),
	});
}

export function entrar(email: string, senha: string) {
	return requisitar<RespostaAutenticacao>('/api/autenticacao/entrar', {
		method: 'POST',
		body: JSON.stringify({ email, senha }),
	});
}
