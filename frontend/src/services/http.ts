import { limparSessao } from './sessao';

const URL_API = import.meta.env.VITE_URL_API ?? 'http://localhost:8000';

export class ErroHttp extends Error {
	status: number;

	constructor(mensagem: string, status: number) {
		super(mensagem);
		this.status = status;
	}
}

export async function requisitar<T>(caminho: string, opcoes: RequestInit): Promise<T> {
	const resposta = await fetch(`${URL_API}${caminho}`, {
		...opcoes,
		headers: { 'Content-Type': 'application/json', ...opcoes.headers },
	});
	const corpo = await resposta.json().catch(() => ({}));
	if (!resposta.ok) {
		throw new ErroHttp(
			typeof corpo.detail === 'string' ? corpo.detail : 'Verifique os dados informados.',
			resposta.status,
		);
	}
	return corpo as T;
}

export async function requisitarAutenticado<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
	const token = localStorage.getItem('financeiro_token');
	try {
		return await requisitar<T>(caminho, {
			...opcoes,
			headers: { Authorization: `Bearer ${token}` },
		});
	} catch (erro) {
		if (erro instanceof ErroHttp && erro.status === 401) {
			limparSessao();
			window.location.assign('/acesso');
		}
		throw erro;
	}
}
