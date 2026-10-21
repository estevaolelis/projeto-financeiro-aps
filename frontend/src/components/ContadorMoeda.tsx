import { useEffect, useRef, useState } from 'react';
import { formatarMoeda } from '../utils/formatacao';

export default function ContadorMoeda({ valor }: { valor: number }) {
  const [exibido, definirExibido] = useState(valor);
  const origem = useRef(valor);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      origem.current = valor;
      definirExibido(valor);
      return;
    }
    const inicio = origem.current;
    const comeco = performance.now();
    let quadro = 0;
    const passo = (agora: number) => {
      const progresso = Math.min((agora - comeco) / 700, 1);
      const suave = 1 - (1 - progresso) ** 3;
      const atual = inicio + (valor - inicio) * suave;
      origem.current = atual;
      definirExibido(atual);
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor]);

  return <>{formatarMoeda(exibido)}</>;
}
