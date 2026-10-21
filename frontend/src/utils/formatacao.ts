export const formatarMoeda = (valor: string | number) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Valor curto para eixos de gráfico (ex.: 80 mil), evita rótulos cortados. */
export const formatarCompacto = (valor: number) =>
  valor.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const formatarData = (data: string) => data.split('-').reverse().join('/');

export const hoje = () => new Date().toLocaleDateString('sv-SE');
