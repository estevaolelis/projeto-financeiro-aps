const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type User = {
	id_usuario: number;
	nome: string;
	email: string;
};

type AuthResponse = {
	access_token: string;
	token_type: string;
	user: User;
};

async function request<T>(path: string, options: RequestInit): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: { 'Content-Type': 'application/json', ...options.headers },
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(body.detail ?? 'Não foi possível concluir a operação.');
	}
	return body as T;
}

export function register(nome: string, email: string, senha: string) {
	return request<User>('/api/auth/register', {
		method: 'POST',
		body: JSON.stringify({ nome, email, senha }),
	});
}

export function login(email: string, senha: string) {
	return request<AuthResponse>('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, senha }),
	});
}

export function getStoredUser(): User | null {
	const storedUser = localStorage.getItem('financeiro_user');
	if (!storedUser) return null;
	try {
		return JSON.parse(storedUser) as User;
	} catch {
		return null;
	}
}

export function isAuthenticated() {
	return Boolean(localStorage.getItem('financeiro_token') && getStoredUser());
}

export function saveSession(auth: AuthResponse) {
	localStorage.setItem('financeiro_token', auth.access_token);
	localStorage.setItem('financeiro_user', JSON.stringify(auth.user));
}

export function clearSession() {
	localStorage.removeItem('financeiro_token');
	localStorage.removeItem('financeiro_user');
}
