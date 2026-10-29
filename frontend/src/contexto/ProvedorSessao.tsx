import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { obterUsuarioAtual, sair as encerrarSessao } from '../services/auth';
import type { Usuario } from '../services/auth';
import { ContextoSessao } from './sessao';

/** O servidor é a fonte da verdade: o cookie HttpOnly não é legível aqui, então perguntamos a /eu. */
export default function ProvedorSessao({ children: conteudo }: { children: ReactNode }) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem('financeiro_token');
      localStorage.removeItem('financeiro_usuario');
    } catch { /* armazenamento indisponível: nada a limpar */ }

    obterUsuarioAtual()
      .then(definirUsuario)
      .catch(() => definirUsuario(null))
      .finally(() => definirCarregando(false));
  }, []);

  const sair = useCallback(async () => {
    try {
      await encerrarSessao();
    } finally {
      definirUsuario(null);
    }
  }, []);

  const valor = useMemo(() => ({ usuario, carregando, definirUsuario, sair }), [usuario, carregando, sair]);

  return <ContextoSessao.Provider value={valor}>{conteudo}</ContextoSessao.Provider>;
}
