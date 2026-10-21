import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { Calculator, LifeBuoy, TrendingUp, Wallet } from 'lucide-react';
import { listarMovimentacoes } from '../services/movimentacoes';
import { formatarMoeda } from '../utils/formatacao';
import {
  formatarPrazo, jurosCompostos, mesesParaMeta, numero, quitarDivida, taxaMensal,
} from '../utils/simuladores';
import type { Frequencia } from '../utils/simuladores';

const MSG_OBRIGATORIO = 'Informe um valor válido (ex.: 1500,50).';

type PropsCampo = {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  /** Devolve a mensagem de erro, ou '' quando o valor é aceito. */
  validar: (numeroDigitado: number) => string;
  prefixo?: string;
  sufixo?: string;
  opcional?: boolean;
};

function Campo({ rotulo, valor, aoMudar, validar, prefixo, sufixo, opcional }: PropsCampo) {
  const vazio = valor.trim() === '';
  const mensagem = vazio ? (opcional ? '' : MSG_OBRIGATORIO) : (() => {
    const digitado = numero(valor);
    return Number.isNaN(digitado) ? MSG_OBRIGATORIO : validar(digitado);
  })();
  const mostrarErro = mensagem !== '' && !vazio; // não acusa erro em campo ainda não preenchido
  return (
    <TextField
      label={rotulo}
      value={valor}
      onChange={(evento) => aoMudar(evento.target.value)}
      error={mostrarErro}
      helperText={mostrarErro ? mensagem : ' '}
      slotProps={{
        htmlInput: { inputMode: 'decimal' },
        input: {
          startAdornment: prefixo ? <Typography color="text.secondary" sx={{ mr: 1 }}>{prefixo}</Typography> : undefined,
          endAdornment: sufixo ? <Typography color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>{sufixo}</Typography> : undefined,
        },
      }}
    />
  );
}

/** Resultado de um campo como número válido, ou null se vazio/inválido/recusado pela validação. */
const valido = (texto: string, validar: (n: number) => string, opcional = false) => {
  if (texto.trim() === '') return opcional ? 0 : null;
  const digitado = numero(texto);
  return Number.isNaN(digitado) || validar(digitado) !== '' ? null : digitado;
};

const positivo = (n: number) => (n > 0 ? '' : 'Deve ser maior que zero.');
const naoNegativo = (n: number) => (n >= 0 ? '' : 'Não pode ser negativo.');
const limiteValor = (n: number) => (n > 1e12 ? 'Valor muito alto.' : '');
const valorMonetario = (n: number) => naoNegativo(n) || limiteValor(n);
const valorPositivo = (n: number) => positivo(n) || limiteValor(n);
const taxaPercentual = (n: number) => (n > 100 ? 'Use até 100%.' : '');

function Resultado({ titulo, valor, cor, detalhe }: { titulo: string; valor: ReactNode; cor?: string; detalhe?: string }) {
  return (
    <Paper sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,.02)' }}>
      <Typography variant="body2" color="text.secondary">{titulo}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: cor, fontVariantNumeric: 'tabular-nums' }}>{valor}</Typography>
      {detalhe && <Typography variant="caption" color="text.secondary">{detalhe}</Typography>}
    </Paper>
  );
}

const GradeCampos = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>{children}</Box>
);

function SimuladorJuros() {
  const [capital, definirCapital] = useState('1000');
  const [aporte, definirAporte] = useState('300');
  const [taxa, definirTaxa] = useState('10');
  const [frequencia, definirFrequencia] = useState<Frequencia>('ANUAL');
  const [prazo, definirPrazo] = useState('10');
  const [unidade, definirUnidade] = useState<'ANOS' | 'MESES'>('ANOS');

  const resultado = useMemo(() => {
    const capitalNumero = valido(capital, valorMonetario, true);
    const aporteNumero = valido(aporte, valorMonetario, true);
    const taxaNumero = valido(taxa, (n) => naoNegativo(n) || taxaPercentual(n));
    const prazoBruto = valido(prazo, positivo);
    if (capitalNumero === null || aporteNumero === null || taxaNumero === null || prazoBruto === null) return null;
    const meses = Math.round(unidade === 'ANOS' ? prazoBruto * 12 : prazoBruto);
    if (meses < 1 || meses > 1200) return { erro: 'O prazo deve ficar entre 1 mês e 100 anos.' };
    if (capitalNumero === 0 && aporteNumero === 0) return { erro: 'Informe um capital inicial ou um aporte mensal.' };
    return { calculo: jurosCompostos(capitalNumero, aporteNumero, taxaMensal(taxaNumero, frequencia), meses), meses };
  }, [capital, aporte, taxa, frequencia, prazo, unidade]);

  const grafico = resultado && 'calculo' in resultado && resultado.calculo
    ? resultado.calculo.evolucao.filter((_, indice, lista) => lista.length <= 150 || indice % Math.ceil(lista.length / 150) === 0 || indice === lista.length - 1)
    : [];

  return (
    <Stack spacing={3}>
      <GradeCampos>
        <Campo rotulo="Capital inicial" prefixo="R$" valor={capital} aoMudar={definirCapital} validar={valorMonetario} opcional />
        <Campo rotulo="Aporte mensal" prefixo="R$" valor={aporte} aoMudar={definirAporte} validar={valorMonetario} opcional />
        <Stack direction="row" spacing={1}>
          <Box sx={{ flex: 1 }}><Campo rotulo="Taxa de juros" sufixo="%" valor={taxa} aoMudar={definirTaxa} validar={(n) => naoNegativo(n) || taxaPercentual(n)} /></Box>
          <TextField select label="Período" value={frequencia} onChange={(evento) => definirFrequencia(evento.target.value as Frequencia)} sx={{ width: 130 }}>
            <MenuItem value="ANUAL">ao ano</MenuItem><MenuItem value="MENSAL">ao mês</MenuItem>
          </TextField>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Box sx={{ flex: 1 }}><Campo rotulo="Prazo" valor={prazo} aoMudar={definirPrazo} validar={positivo} /></Box>
          <TextField select label="Unidade" value={unidade} onChange={(evento) => definirUnidade(evento.target.value as 'ANOS' | 'MESES')} sx={{ width: 130 }}>
            <MenuItem value="ANOS">anos</MenuItem><MenuItem value="MESES">meses</MenuItem>
          </TextField>
        </Stack>
      </GradeCampos>

      {resultado === null && <Alert severity="info">Preencha os campos com valores válidos para ver a simulação.</Alert>}
      {resultado && 'erro' in resultado && <Alert severity="warning">{resultado.erro}</Alert>}
      {resultado && 'calculo' in resultado && resultado.calculo && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Resultado titulo="Total investido" valor={formatarMoeda(resultado.calculo.investido)} />
            <Resultado titulo="Juros ganhos" valor={formatarMoeda(resultado.calculo.juros)} cor="#66bb6a" />
            <Resultado titulo="Montante final" valor={formatarMoeda(resultado.calculo.montante)} cor="#aab0ff" detalhe={`em ${formatarPrazo(resultado.meses)}`} />
          </Box>
          <LineChart
            height={300}
            xAxis={[{ scaleType: 'linear', data: grafico.map((ponto) => ponto.mes), label: 'Meses', valueFormatter: (mes: number) => `Mês ${mes}` }]}
            series={[
              { data: grafico.map((ponto) => ponto.investido), label: 'Total investido', color: '#3987e5', showMark: false, valueFormatter: (v) => formatarMoeda(v ?? 0) },
              { data: grafico.map((ponto) => ponto.montante), label: 'Montante', color: '#199e70', area: true, showMark: false, valueFormatter: (v) => formatarMoeda(v ?? 0) },
            ]}
          />
          <Typography variant="caption" color="text.secondary">Aportes feitos no fim de cada mês. Simulação sem impostos, taxas ou inflação; rentabilidade passada não garante resultados futuros.</Typography>
        </>
      )}
    </Stack>
  );
}

function SimuladorReserva() {
  const [despesas, definirDespesas] = useState('3000');
  const [meses, definirMeses] = useState('6');
  const [atual, definirAtual] = useState('2000');
  const [aporte, definirAporte] = useState('500');
  const [rendimento, definirRendimento] = useState('0');
  const [buscando, definirBuscando] = useState(false);
  const [avisoMedia, definirAvisoMedia] = useState('');

  async function usarMediaDasDespesas() {
    definirBuscando(true);
    definirAvisoMedia('');
    try {
      const movimentacoes = await listarMovimentacoes({ tipo: 'DESPESA', id_categoria: '', data_inicio: '', data_fim: '' });
      const hoje = new Date();
      const limite = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1).toLocaleDateString('sv-SE');
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toLocaleDateString('sv-SE');
      const dosUltimos = movimentacoes.filter((item) => item.data_movimentacao >= limite && item.data_movimentacao < fim);
      if (dosUltimos.length === 0) {
        definirAvisoMedia('Não há despesas nos 3 meses fechados anteriores ao atual.');
        return;
      }
      const media = dosUltimos.reduce((soma, item) => soma + Number(item.valor), 0) / 3;
      definirDespesas(media.toFixed(2).replace('.', ','));
      definirAvisoMedia('Média das suas despesas dos últimos 3 meses fechados.');
    } catch (erro) {
      definirAvisoMedia(erro instanceof Error ? erro.message : 'Não foi possível buscar suas despesas.');
    } finally {
      definirBuscando(false);
    }
  }

  const resultado = useMemo(() => {
    const despesasNumero = valido(despesas, valorPositivo);
    const mesesNumero = valido(meses, (n) => (n >= 1 && n <= 36 && Number.isInteger(n) ? '' : 'Use um número inteiro de 1 a 36.'));
    const atualNumero = valido(atual, valorMonetario, true);
    const aporteNumero = valido(aporte, valorMonetario, true);
    const rendimentoNumero = valido(rendimento, (n) => naoNegativo(n) || taxaPercentual(n), true);
    if ([despesasNumero, mesesNumero, atualNumero, aporteNumero, rendimentoNumero].some((valor) => valor === null)) return null;
    const meta = (despesasNumero as number) * (mesesNumero as number);
    const prazo = mesesParaMeta(atualNumero as number, meta, aporteNumero as number, taxaMensal(rendimentoNumero as number, 'ANUAL'));
    return { meta, falta: Math.max(0, meta - (atualNumero as number)), progresso: Math.min(100, ((atualNumero as number) / meta) * 100), prazo };
  }, [despesas, meses, atual, aporte, rendimento]);

  return (
    <Stack spacing={3}>
      <GradeCampos>
        <Box>
          <Campo rotulo="Despesas mensais essenciais" prefixo="R$" valor={despesas} aoMudar={definirDespesas} validar={valorPositivo} />
          <Button size="small" onClick={usarMediaDasDespesas} disabled={buscando} sx={{ mt: -1 }}>{buscando ? 'Buscando...' : 'Usar a média das minhas despesas'}</Button>
        </Box>
        <Campo rotulo="Meses de cobertura" valor={meses} aoMudar={definirMeses} validar={(n) => (n >= 1 && n <= 36 && Number.isInteger(n) ? '' : 'Use um número inteiro de 1 a 36.')} />
        <Campo rotulo="Reserva atual" prefixo="R$" valor={atual} aoMudar={definirAtual} validar={valorMonetario} opcional />
        <Campo rotulo="Quanto consegue guardar por mês" prefixo="R$" valor={aporte} aoMudar={definirAporte} validar={valorMonetario} opcional />
        <Campo rotulo="Rendimento da reserva" sufixo="% ao ano" valor={rendimento} aoMudar={definirRendimento} validar={(n) => naoNegativo(n) || taxaPercentual(n)} opcional />
      </GradeCampos>
      {avisoMedia && <Alert severity="info">{avisoMedia}</Alert>}

      {resultado === null && <Alert severity="info">Preencha os campos com valores válidos para ver a simulação.</Alert>}
      {resultado && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Resultado titulo="Meta da reserva" valor={formatarMoeda(resultado.meta)} cor="#aab0ff" />
            <Resultado titulo="Falta guardar" valor={formatarMoeda(resultado.falta)} cor={resultado.falta === 0 ? '#66bb6a' : undefined} />
            <Resultado titulo="Tempo para alcançar" valor={resultado.prazo === null ? 'Não alcançável' : formatarPrazo(resultado.prazo)}
              detalhe={resultado.prazo === null ? 'Aumente o valor guardado por mês.' : undefined} />
          </Box>
          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Progresso da reserva</Typography>
              <Typography variant="body2" color="text.secondary">{resultado.progresso.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</Typography>
            </Stack>
            <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,.08)' }}>
              <Box sx={{ height: 10, borderRadius: 999, bgcolor: resultado.progresso >= 100 ? 'success.main' : 'primary.main', width: `${resultado.progresso}%`, transition: 'width .4s ease' }} />
            </Box>
          </Box>
          {resultado.falta === 0 && <Alert severity="success">Parabéns! Sua reserva já cobre o período escolhido.</Alert>}
          <Typography variant="caption" color="text.secondary">Referência comum: de 3 a 6 meses de despesas essenciais (até 12 para renda variável).</Typography>
        </>
      )}
    </Stack>
  );
}

function SimuladorDivida() {
  const [saldo, definirSaldo] = useState('5000');
  const [taxa, definirTaxa] = useState('3');
  const [pagamento, definirPagamento] = useState('400');

  const resultado = useMemo(() => {
    const saldoNumero = valido(saldo, valorPositivo);
    const taxaNumero = valido(taxa, (n) => naoNegativo(n) || taxaPercentual(n));
    const pagamentoNumero = valido(pagamento, valorPositivo);
    if (saldoNumero === null || taxaNumero === null || pagamentoNumero === null) return null;
    const juros = taxaNumero / 100;
    const base = quitarDivida(saldoNumero, juros, pagamentoNumero);
    const maisAlto = quitarDivida(saldoNumero, juros, pagamentoNumero * 1.25);
    return { base, maisAlto, pagamentoNumero };
  }, [saldo, taxa, pagamento]);

  return (
    <Stack spacing={3}>
      <GradeCampos>
        <Campo rotulo="Saldo devedor" prefixo="R$" valor={saldo} aoMudar={definirSaldo} validar={valorPositivo} />
        <Campo rotulo="Juros da dívida" sufixo="% ao mês" valor={taxa} aoMudar={definirTaxa} validar={(n) => naoNegativo(n) || taxaPercentual(n)} />
        <Campo rotulo="Pagamento mensal" prefixo="R$" valor={pagamento} aoMudar={definirPagamento} validar={valorPositivo} />
      </GradeCampos>

      {resultado === null && <Alert severity="info">Preencha os campos com valores válidos para ver a simulação.</Alert>}
      {resultado && !resultado.base.quita && (
        <Alert severity="error">
          Com esse pagamento a dívida nunca será quitada: só os juros do primeiro mês já somam {formatarMoeda(resultado.base.jurosPrimeiroMes)}. Aumente o pagamento mensal.
        </Alert>
      )}
      {resultado && resultado.base.quita && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Resultado titulo="Tempo para quitar" valor={formatarPrazo(resultado.base.meses)} cor="#aab0ff" />
            <Resultado titulo="Total pago" valor={formatarMoeda(resultado.base.totalPago)} />
            <Resultado titulo="Total de juros" valor={formatarMoeda(resultado.base.totalJuros)} cor="#ef5350" />
          </Box>
          {resultado.maisAlto.quita && (
            <Alert severity="success" icon={<TrendingUp size={20} />}>
              Pagando 25% a mais por mês ({formatarMoeda(resultado.pagamentoNumero * 1.25)}), você quita em {formatarPrazo(resultado.maisAlto.meses)} e economiza {formatarMoeda(resultado.base.totalJuros - resultado.maisAlto.totalJuros)} em juros.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}

const SIMULADORES = [
  { rotulo: 'Juros compostos', icone: <TrendingUp size={18} />, descricao: 'Veja quanto seu dinheiro pode render com aportes mensais ao longo do tempo.', componente: <SimuladorJuros /> },
  { rotulo: 'Reserva de emergência', icone: <LifeBuoy size={18} />, descricao: 'Descubra o tamanho ideal da sua reserva e em quanto tempo você chega lá.', componente: <SimuladorReserva /> },
  { rotulo: 'Quitação de dívidas', icone: <Wallet size={18} />, descricao: 'Calcule em quanto tempo uma dívida acaba e quanto você paga de juros.', componente: <SimuladorDivida /> },
];

export default function Calculadora() {
  const [aba, definirAba] = useState(0);
  const atual = SIMULADORES[aba];
  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Calculator size={28} color="#7c83ff" />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Simuladores financeiros</Typography>
        </Stack>
        <Typography color="text.secondary">Teste cenários e tome decisões com mais segurança.</Typography>
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Tabs value={aba} onChange={(_, novo: number) => definirAba(novo)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
          {SIMULADORES.map(({ rotulo, icone }) => <Tab key={rotulo} label={rotulo} icon={icone} iconPosition="start" />)}
        </Tabs>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{atual.descricao}</Typography>
        {atual.componente}
      </Paper>
    </Stack>
  );
}
