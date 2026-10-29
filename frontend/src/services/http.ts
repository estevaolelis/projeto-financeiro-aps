const URL_API = import.meta.env.VITE_URL_API ?? '';

export class ErroHttp extends Error {
	status: number;

	constructor(mensagem: string, status: number) {
		super(mensagem);
		this.status = status;
	}
}

export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
	const resposta = await fetch(`${URL_API}${caminho}`, {
		...opcoes,
		credentials: 'include',
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
	try {
		return await requisitar<T>(caminho, opcoes);
	} catch (erro) {
		if (erro instanceof ErroHttp && erro.status === 401) {
			window.location.assign('/acesso');
		}
		throw erro;
	}
}
