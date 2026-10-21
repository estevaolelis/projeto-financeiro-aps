import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { criarTema } from '../tema';
import type { ModoCor } from '../tema';
import { ContextoModoCor } from './modoCor';

const CHAVE = 'financeiro_modo_cor';

/** Modo salvo; se não houver, a preferência do sistema. Calculado antes da 1ª renderização, sem piscar. */
function modoInicial(): ModoCor {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'light' || salvo === 'dark') return salvo;
  } catch { /* armazenamento indisponível: cai na preferência do sistema */ }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ProvedorTema({ children: conteudo }: { children: ReactNode }) {
  const [modo, definirModo] = useState<ModoCor>(modoInicial);
  const tema = useMemo(() => criarTema(modo), [modo]);

  const alternar = useCallback(() => {
    definirModo((atual) => {
      const proximo = atual === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(CHAVE, proximo); } catch { /* a escolha só não fica salva */ }
      return proximo;
    });
  }, []);

  // Mantém várias abas em sincronia.
  useEffect(() => {
    const aoMudar = (evento: StorageEvent) => {
      if (evento.key === CHAVE && (evento.newValue === 'light' || evento.newValue === 'dark')) definirModo(evento.newValue);
    };
    window.addEventListener('storage', aoMudar);
    return () => window.removeEventListener('storage', aoMudar);
  }, []);

  const valor = useMemo(() => ({ modo, alternar }), [modo, alternar]);

  return (
    <ContextoModoCor.Provider value={valor}>
      <ThemeProvider theme={tema}>
        <CssBaseline />
        {conteudo}
      </ThemeProvider>
    </ContextoModoCor.Provider>
  );
}
