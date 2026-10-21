const MAX_MESES = 1200;

/** Converte texto digitado (aceita "1.500,50" e "1500.50") em número; NaN se vazio ou inválido. */
export function numero(texto: string): number {
	const limpo = texto.trim().replace(/\s/g, '');
	if (limpo === '') return NaN;
	const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
	return /^\d+(\.\d+)?$/.test(normalizado) ? Number(normalizado) : NaN;
}

export type Frequencia = 'MENSAL' | 'ANUAL';

/** Taxa mensal equivalente (decimal) a partir de uma taxa percentual mensal ou anual. */
export const taxaMensal = (percentual: number, frequencia: Frequencia) =>
	frequencia === 'MENSAL' ? percentual / 100 : (1 + percentual / 100) ** (1 / 12) - 1;

export type PontoEvolucao = { mes: number; investido: number; montante: number };

export function jurosCompostos(capital: number, aporte: number, taxa: number, meses: number) {
	let montante = capital;
	let investido = capital;
	const evolucao: PontoEvolucao[] = [{ mes: 0, investido, montante }];
	for (let mes = 1; mes <= meses; mes += 1) {
		montante = montante * (1 + taxa) + aporte;
		investido += aporte;
		evolucao.push({ mes, investido, montante });
	}
	return { montante, investido, juros: montante - investido, evolucao };
}

/** Meses para a reserva chegar à meta, ou null se não for alcançável no limite de tempo. */
export function mesesParaMeta(atual: number, meta: number, aporte: number, taxa: number) {
	if (atual >= meta) return 0;
	let saldo = atual;
	for (let mes = 1; mes <= MAX_MESES; mes += 1) {
		saldo = saldo * (1 + taxa) + aporte;
		if (saldo >= meta) return mes;
	}
	return null;
}

export type ResultadoDivida =
	| { quita: false; jurosPrimeiroMes: number }
	| { quita: true; meses: number; totalPago: number; totalJuros: number };

export function quitarDivida(saldo: number, taxa: number, pagamento: number): ResultadoDivida {
	const jurosPrimeiroMes = saldo * taxa;
	if (pagamento <= jurosPrimeiroMes) return { quita: false, jurosPrimeiroMes };
	let devedor = saldo;
	let totalPago = 0;
	let meses = 0;
	while (devedor > 0.005 && meses < MAX_MESES) {
		devedor += devedor * taxa;
		const parcela = Math.min(pagamento, devedor);
		devedor -= parcela;
		totalPago += parcela;
		meses += 1;
	}
	return { quita: true, meses, totalPago, totalJuros: totalPago - saldo };
}

export function formatarPrazo(meses: number) {
	const anos = Math.floor(meses / 12);
	const resto = meses % 12;
	const partes = [
		anos > 0 && `${anos} ${anos === 1 ? 'ano' : 'anos'}`,
		resto > 0 && `${resto} ${resto === 1 ? 'mês' : 'meses'}`,
	].filter(Boolean);
	return partes.length ? partes.join(' e ') : 'Já alcançada';
}
