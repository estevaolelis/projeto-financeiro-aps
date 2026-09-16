const URL_API = import.meta.env.VITE_URL_API ?? 'http://localhost:8000';

export type Usuario = {
	id_usuario: number;
	nome: string;
	email: string;
};

type RespostaAutenticacao = {
	token_acesso: string;
	tipo_token: string;
	usuario: Usuario;
};

async function requisitar<T>(caminho: string, opcoes: RequestInit): Promise<T> {
	const resposta = await fetch(`${URL_API}${caminho}`, {
		...opcoes,
		headers: { 'Content-Type': 'application/json', ...opcoes.headers },
	});
	const corpo = await resposta.json().catch(() => ({}));
	if (!resposta.ok) {
		throw new Error(corpo.detail ?? 'Não foi possível concluir a operação.');
	}
	return corpo as T;
}

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

export function obterUsuarioArmazenado(): Usuario | null {
	const usuarioArmazenado = localStorage.getItem('financeiro_usuario');
	if (!usuarioArmazenado) return null;
	try {
		return JSON.parse(usuarioArmazenado) as Usuario;
	} catch {
		return null;
	}
}

export function estaAutenticado() {
	return Boolean(localStorage.getItem('financeiro_token') && obterUsuarioArmazenado());
}

export function salvarSessao(autenticacao: RespostaAutenticacao) {
	localStorage.setItem('financeiro_token', autenticacao.token_acesso);
	localStorage.setItem('financeiro_usuario', JSON.stringify(autenticacao.usuario));
}

export function limparSessao() {
	localStorage.removeItem('financeiro_token');
	localStorage.removeItem('financeiro_usuario');
}
