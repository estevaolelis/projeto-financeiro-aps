export const formatarMoeda = (valor: string | number) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarData = (data: string) => data.split('-').reverse().join('/');

export const hoje = () => new Date().toLocaleDateString('sv-SE');
