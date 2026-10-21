import { useEffect, useMemo, useState } from 'react';
import { Link as LinkRouter } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, alpha, useTheme, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Flame, PiggyBank, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Theme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import AlertasOrcamento from '../components/AlertasOrcamento';
import ContadorMoeda from '../components/ContadorMoeda';
import { obterUsuarioArmazenado } from '../services/sessao';
import { listarMovimentacoes } from '../services/movimentacoes';
import type { Movimentacao } from '../services/movimentacoes';
import { listarOrcamentos } from '../services/orcamentos';
import type { Orcamento } from '../services/orcamentos';
import { formatarCompacto, formatarData, formatarMoeda, hoje } from '../utils/formatacao';
import { useModoCor } from '../contexto/modoCor';
import { corDestaque } from '../tema';
import {
  PRESETS, coresDasCategorias, despesasPorCategoria, noPeriodo, periodoAnterior, periodoDoPreset,
  serieTemporal, totais, variacao,
} from '../utils/dashboard';
import type { Periodo, PresetPeriodo } from '../utils/dashboard';

const FILTROS_VAZIOS = { tipo: '', id_categoria: '', data_inicio: '', data_fim: '' } as const;

type PropsKpi = {
  titulo: string;
  icone: ReactNode;
  valor: ReactNode;
  cor?: string;
  destaque?: boolean;
  delta?: number | null;
  deltaInvertido?: boolean;
  rodape?: string;
};

function Kpi({ titulo, icone, valor, cor, destaque, delta, deltaInvertido, rodape }: PropsKpi) {
  const bom = delta == null ? null : deltaInvertido ? delta <= 0 : delta >= 0;
  return (
    <Paper sx={{
      p: 2.5, position: 'relative', overflow: 'hidden',
      ...(destaque && {
        background: (tema: Theme) => `linear-gradient(135deg, ${alpha(tema.palette.primary.main, 0.26)}, ${tema.palette.background.paper} 70%)`,
        border: 1,
        borderColor: (tema: Theme) => alpha(tema.palette.primary.main, 0.45),
      }),
    }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary', mb: 1 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: cor ?? corDestaque }}>{icone}</Box>
        <Typography variant="body2">{titulo}</Typography>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 800, color: cor, fontVariantNumeric: 'tabular-nums' }}>{valor}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center', minHeight: 24 }}>
        {delta != null && (
          <Chip size="small" color={bom ? 'success' : 'error'} variant="outlined"
            icon={delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            label={`${delta >= 0 ? '+' : ''}${delta.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
        )}
        {(delta != null || rodape) && <Typography variant="caption" color="text.secondary">{rodape ?? 'vs período anterior'}</Typography>}
      </Stack>
    </Paper>
  );
}

function CartaoGrafico({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{titulo}</Typography>
      {subtitulo && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{subtitulo}</Typography>}
      {children}
    </Paper>
  );
}

const SemDados = ({ texto }: { texto: string }) => (
  <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>{texto}</Typography>
);

export default function Inicio() {
  const usuario = obterUsuarioArmazenado();
  const tema = useTheme();
  const { modo } = useModoCor();
  const [movimentacoes, definirMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregado, definirCarregado] = useState(false);
  const [erro, definirErro] = useState('');
  const [orcamentos, definirOrcamentos] = useState<Orcamento[]>([]);
  const [preset, definirPreset] = useState<PresetPeriodo>('6m');
  const [periodo, definirPeriodo] = useState<Periodo>(() => periodoDoPreset('6m'));

  useEffect(() => {
    listarMovimentacoes(FILTROS_VAZIOS)
      .then(definirMovimentacoes)
      .catch((erroRequisicao) => definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível carregar os dados.'))
      .finally(() => definirCarregado(true));
  }, []);

  useEffect(() => {
    const dataAtual = new Date();
    listarOrcamentos(dataAtual.getMonth() + 1, dataAtual.getFullYear()).then(definirOrcamentos).catch(() => undefined);
  }, []);

  function escolherPreset(novo: PresetPeriodo | null) {
    if (!novo) return;
    definirPreset(novo);
    if (novo !== 'custom') definirPeriodo(periodoDoPreset(novo));
  }

  const periodoValido = periodo.inicio !== '' && periodo.fim !== '' && periodo.inicio <= periodo.fim;

  const painel = useMemo(() => {
    if (!periodoValido) return null;
    const itens = noPeriodo(movimentacoes, periodo);
    const atual = totais(itens);
    const anterior = totais(noPeriodo(movimentacoes, periodoAnterior(periodo)));
    const cores = coresDasCategorias(movimentacoes, modo);
    const categorias = despesasPorCategoria(itens, cores);
    const serie = serieTemporal(movimentacoes, periodo);
    const despesasItens = itens.filter((item) => item.tipo === 'DESPESA');
    const maiorDespesa = despesasItens.reduce<Movimentacao | null>((maior, item) => (!maior || Number(item.valor) > Number(maior.valor) ? item : maior), null);
    const dias = Math.max(1, Math.round((new Date(periodo.fim).getTime() - new Date(periodo.inicio).getTime()) / 86_400_000) + 1);
    return { itens, atual, anterior, categorias, serie, maiorDespesa, mediaDiaria: atual.despesas / dias };
  }, [movimentacoes, periodo, periodoValido, modo]);

  const saldoAtual = useMemo(
    () => movimentacoes.filter((item) => item.data_movimentacao <= hoje()).reduce((soma, item) => soma + (item.tipo === 'RECEITA' ? 1 : -1) * Number(item.valor), 0),
    [movimentacoes],
  );

  const recentes = movimentacoes.slice(0, 5);
  const primeiroNome = usuario?.nome.split(' ')[0];
  const semNenhumDado = carregado && !erro && movimentacoes.length === 0;
  const rotuloPeriodo = periodoValido ? `${formatarData(periodo.inicio)} a ${formatarData(periodo.fim)}` : 'Período inválido';

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Olá, {primeiroNome}</Typography>
          <Typography color="text.secondary">Seu painel financeiro · {rotuloPeriodo}</Typography>
        </Box>
        <Button component={LinkRouter} to="/movimentacoes" state={{ abrirNova: true }} variant="contained" startIcon={<Plus size={18} />}>Nova movimentação</Button>
      </Stack>

      {erro && <Alert severity="error">{erro}</Alert>}

      <AlertasOrcamento orcamentos={orcamentos} />

      {semNenhumDado ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ color: 'primary.main', display: 'inline-flex' }}><Wallet size={44} /></Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 2 }}>Seu painel começa aqui</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Cadastre sua primeira receita ou despesa para ver saldo, gráficos e comparativos.</Typography>
          <Button component={LinkRouter} to="/movimentacoes" state={{ abrirNova: true }} variant="contained" startIcon={<Plus size={18} />}>Cadastrar movimentação</Button>
        </Paper>
      ) : (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
            <ToggleButtonGroup exclusive size="small" value={preset} onChange={(_, novo) => escolherPreset(novo)} aria-label="Período" sx={{ flexWrap: 'wrap' }}>
              {PRESETS.map(({ valor, rotulo }) => <ToggleButton key={valor} value={valor}>{rotulo}</ToggleButton>)}
              <ToggleButton value="custom">Personalizado</ToggleButton>
            </ToggleButtonGroup>
            {preset === 'custom' && (
              <Stack direction="row" spacing={1}>
                <TextField size="small" type="date" label="De" value={periodo.inicio} onChange={(evento) => definirPeriodo((atual) => ({ ...atual, inicio: evento.target.value }))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: periodo.fim || undefined } }} />
                <TextField size="small" type="date" label="Até" value={periodo.fim} onChange={(evento) => definirPeriodo((atual) => ({ ...atual, fim: evento.target.value }))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: periodo.inicio || undefined } }} />
              </Stack>
            )}
          </Stack>

          {!painel && <Alert severity="warning">Informe um período válido: a data inicial não pode ser maior que a final.</Alert>}

          {painel && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Kpi destaque titulo="Saldo atual" icone={<Wallet size={16} />} valor={<ContadorMoeda valor={saldoAtual} />} cor={saldoAtual < 0 ? 'error.main' : undefined} rodape="todas as movimentações até hoje" />
                <Kpi titulo="Receitas do período" icone={<TrendingUp size={16} />} valor={<ContadorMoeda valor={painel.atual.receitas} />} cor="success.main" delta={variacao(painel.atual.receitas, painel.anterior.receitas)} />
                <Kpi titulo="Despesas do período" icone={<TrendingDown size={16} />} valor={<ContadorMoeda valor={painel.atual.despesas} />} cor="error.main" delta={variacao(painel.atual.despesas, painel.anterior.despesas)} deltaInvertido />
                <Kpi titulo="Taxa de economia" icone={<PiggyBank size={16} />}
                  valor={painel.atual.taxaEconomia == null ? '—' : `${painel.atual.taxaEconomia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                  rodape={painel.atual.taxaEconomia == null ? 'sem receitas no período' : `${formatarMoeda(painel.atual.saldo)} guardados no período`} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 2 }}>
                <CartaoGrafico titulo="Receitas x despesas" subtitulo={painel.serie.diario ? 'Por dia' : 'Por mês'}>
                  {painel.itens.length === 0 ? <SemDados texto="Sem movimentações neste período." /> : (
                    <BarChart
                      height={300}
                      borderRadius={6}
                      grid={{ horizontal: true }}
                      xAxis={[{ scaleType: 'band', data: painel.serie.rotulos }]}
                      yAxis={[{ width: 56, valueFormatter: formatarCompacto }]}
                      series={[
                        { data: painel.serie.receitas, label: 'Receitas', color: tema.palette.success.main, valueFormatter: (v) => formatarMoeda(v ?? 0) },
                        { data: painel.serie.despesas, label: 'Despesas', color: tema.palette.error.main, valueFormatter: (v) => formatarMoeda(v ?? 0) },
                      ]}
                    />
                  )}
                </CartaoGrafico>

                <CartaoGrafico titulo="Despesas por categoria" subtitulo={painel.atual.despesas > 0 ? `Total ${formatarMoeda(painel.atual.despesas)}` : undefined}>
                  {painel.categorias.length === 0 ? <SemDados texto="Sem despesas neste período." /> : (
                    <Stack spacing={2}>
                      <PieChart
                        height={200}
                        hideLegend
                        series={[{ data: painel.categorias, innerRadius: 60, paddingAngle: 2, cornerRadius: 4, valueFormatter: ({ value }) => formatarMoeda(value) }]}
                      />
                      <Stack spacing={1.25}>
                        {painel.categorias.slice(0, 6).map((categoria) => (
                          <Box key={categoria.id}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: categoria.color }} />
                                <Typography variant="body2">{categoria.label}</Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary">{formatarMoeda(categoria.value)} · {categoria.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%</Typography>
                            </Stack>
                            <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover', mt: 0.5 }}>
                              <Box sx={{ height: 4, borderRadius: 2, bgcolor: categoria.color, width: `${categoria.percentual}%` }} />
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </CartaoGrafico>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 2 }}>
                <CartaoGrafico titulo="Evolução do saldo" subtitulo="Saldo acumulado ao longo do período">
                  {painel.itens.length === 0 ? <SemDados texto="Sem movimentações neste período." /> : (
                    <LineChart
                      height={280}
                      hideLegend
                      grid={{ horizontal: true }}
                      sx={{ [`& .${lineClasses.area}`]: { fill: 'url(#gradiente-saldo)' } }}
                      xAxis={[{ scaleType: 'point', data: painel.serie.rotulos }]}
                      yAxis={[{ width: 56, valueFormatter: formatarCompacto }]}
                      series={[{ data: painel.serie.saldo, label: 'Saldo', color: tema.palette.primary.main, area: true, showMark: painel.serie.saldo.length <= 12, valueFormatter: (v) => formatarMoeda(v ?? 0) }]}
                    />
                  )}
                  <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
                    <linearGradient id="gradiente-saldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={tema.palette.primary.main} stopOpacity={0.35} />
                      <stop offset="1" stopColor={tema.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </svg>
                </CartaoGrafico>

                <CartaoGrafico titulo="Destaques do período">
                  {painel.itens.length === 0 ? <SemDados texto="Sem dados para destacar." /> : (
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}><Flame size={16} /><Typography variant="body2">Maior despesa</Typography></Stack>
                        {painel.maiorDespesa ? (
                          <>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatarMoeda(painel.maiorDespesa.valor)}</Typography>
                            <Typography variant="body2" color="text.secondary">{painel.maiorDespesa.descricao} · {painel.maiorDespesa.nome_categoria}</Typography>
                          </>
                        ) : <Typography color="text.secondary">Nenhuma despesa.</Typography>}
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}><Receipt size={16} /><Typography variant="body2">Média diária de gastos</Typography></Stack>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatarMoeda(painel.mediaDiaria)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>Despesas fixas x variáveis</Typography>
                        {painel.atual.despesas === 0 ? <Typography color="text.secondary">Nenhuma despesa.</Typography> : (
                          <>
                            <Stack direction="row" spacing="2px" sx={{ height: 10 }}>
                              {painel.atual.fixas > 0 && <Box sx={{ flex: painel.atual.fixas, bgcolor: 'primary.main', borderRadius: '4px' }} />}
                              {painel.atual.variaveis > 0 && <Box sx={{ flex: painel.atual.variaveis, bgcolor: 'warning.main', borderRadius: '4px' }} />}
                            </Stack>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.75 }}>
                              <Typography variant="caption" color="text.secondary">● Fixas {formatarMoeda(painel.atual.fixas)}</Typography>
                              <Typography variant="caption" color="text.secondary">● Variáveis {formatarMoeda(painel.atual.variaveis)}</Typography>
                            </Stack>
                          </>
                        )}
                      </Box>
                    </Stack>
                  )}
                </CartaoGrafico>
              </Box>
            </>
          )}

          <Paper sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Últimas movimentações</Typography>
              <Button component={LinkRouter} to="/movimentacoes" color="inherit" size="small" endIcon={<ArrowRight size={16} />}>Ver todas</Button>
            </Stack>
            <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
              {recentes.map((item) => (
                <Stack key={item.id_movimentacao} direction="row" spacing={2} sx={{ py: 1.5, alignItems: 'center' }}>
                  <Box sx={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: '10px', display: 'grid', placeItems: 'center',
                    color: item.tipo === 'RECEITA' ? 'success.main' : 'error.main',
                    bgcolor: (t: Theme) => alpha(item.tipo === 'RECEITA' ? t.palette.success.main : t.palette.error.main, 0.12),
                  }}>
                    {item.tipo === 'RECEITA' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600 }}>{item.descricao}</Typography>
                    <Typography variant="body2" color="text.secondary">{formatarData(item.data_movimentacao)} · {item.nome_categoria}</Typography>
                  </Box>
                  <Chip size="small" variant="outlined" label={item.natureza === 'FIXA' ? 'Fixa' : 'Variável'} sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
                  <Typography sx={{ color: item.tipo === 'RECEITA' ? 'success.main' : 'error.main', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {item.tipo === 'DESPESA' && '− '}{formatarMoeda(item.valor)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
