export type Usuario = {
	id_usuario: number;
	nome: string;
	email: string;
};

export type RespostaAutenticacao = {
	token_acesso: string;
	tipo_token: string;
	usuario: Usuario;
};

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
