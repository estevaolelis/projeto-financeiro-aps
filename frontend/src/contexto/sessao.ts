import { createContext, useContext } from 'react';
import type { Usuario } from '../services/auth';

type ContextoSessao = {
	usuario: Usuario | null;
	carregando: boolean;
	definirUsuario: (usuario: Usuario | null) => void;
	sair: () => Promise<void>;
};

export const ContextoSessao = createContext<ContextoSessao>({
	usuario: null,
	carregando: true,
	definirUsuario: () => undefined,
	sair: async () => undefined,
});

export const useSessao = () => useContext(ContextoSessao);
