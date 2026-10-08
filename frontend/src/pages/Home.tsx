import { useEffect, useMemo, useState } from 'react';
import { Link as LinkRouter } from 'react-router-dom';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowRight, Plus } from 'lucide-react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { obterUsuarioArmazenado } from '../services/sessao';
import { listarMovimentacoes } from '../services/movimentacoes';
import type { Movimentacao } from '../services/movimentacoes';
import { formatarData, formatarMoeda, hoje } from '../utils/formatacao';

const FILTROS_VAZIOS = { tipo: '', id_categoria: '', data_inicio: '', data_fim: '' } as const;

export default function Inicio() {
  const usuario = obterUsuarioArmazenado();
  const [movimentacoes, definirMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregado, definirCarregado] = useState(false);
  const [erro, definirErro] = useState('');

  useEffect(() => {
    listarMovimentacoes(FILTROS_VAZIOS)
      .then(definirMovimentacoes)
      .catch((erroRequisicao) => definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível carregar os dados.'))
      .finally(() => definirCarregado(true));
  }, []);

  const mesAtual = hoje().slice(0, 7);
  const nomeMes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const resumo = useMemo(() => {
    const doMes = movimentacoes.filter((item) => item.data_movimentacao.startsWith(mesAtual));
    const somar = (tipo: Movimentacao['tipo']) =>
      doMes.filter((item) => item.tipo === tipo).reduce((soma, item) => soma + Number(item.valor), 0);
    const receitas = somar('RECEITA');
    const despesas = somar('DESPESA');
    return { receitas, despesas, saldo: receitas - despesas };
  }, [movimentacoes, mesAtual]);

  const porCategoria = useMemo(() => {
    const totais = new Map<string, number>();
    movimentacoes
      .filter((item) => item.tipo === 'DESPESA' && item.data_movimentacao.startsWith(mesAtual))
      .forEach((item) => totais.set(item.nome_categoria, (totais.get(item.nome_categoria) ?? 0) + Number(item.valor)));
    return [...totais].map(([label, value], id) => ({ id, label, value }));
  }, [movimentacoes, mesAtual]);

  const porMes = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => {
      const data = new Date();
      data.setDate(1);
      data.setMonth(data.getMonth() - (5 - i));
      return data;
    });
    const total = (chave: string, tipo: Movimentacao['tipo']) =>
      movimentacoes
        .filter((item) => item.tipo === tipo && item.data_movimentacao.startsWith(chave))
        .reduce((soma, item) => soma + Number(item.valor), 0);
    const chaves = meses.map((data) => data.toLocaleDateString('sv-SE').slice(0, 7));
    return {
      rotulos: meses.map((data) => data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')),
      receitas: chaves.map((chave) => total(chave, 'RECEITA')),
      despesas: chaves.map((chave) => total(chave, 'DESPESA')),
    };
  }, [movimentacoes]);

  const recentes = movimentacoes.slice(0, 5);
  const primeiroNome = usuario?.nome.split(' ')[0];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Olá, {primeiroNome}</Typography>
          <Typography color="text.secondary">Resumo de {nomeMes}.</Typography>
        </Box>
        <Button component={LinkRouter} to="/movimentacoes" state={{ abrirNova: true }} variant="contained" startIcon={<Plus size={18} />}>Nova movimentação</Button>
      </Stack>

      {erro && <Alert severity="error">{erro}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Paper sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">Receitas do mês</Typography><Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>{formatarMoeda(resumo.receitas)}</Typography></Paper>
        <Paper sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">Despesas do mês</Typography><Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>{formatarMoeda(resumo.despesas)}</Typography></Paper>
        <Paper sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">Saldo do mês</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{formatarMoeda(resumo.saldo)}</Typography></Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Receitas e despesas</Typography>
          <Typography variant="body2" color="text.secondary">Últimos 6 meses</Typography>
          <BarChart
            height={280}
            xAxis={[{ scaleType: 'band', data: porMes.rotulos }]}
            series={[
              { data: porMes.receitas, label: 'Receitas', color: '#2e7d32', valueFormatter: (v) => formatarMoeda(v ?? 0) },
              { data: porMes.despesas, label: 'Despesas', color: '#d32f2f', valueFormatter: (v) => formatarMoeda(v ?? 0) },
            ]}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Despesas por categoria</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{nomeMes}</Typography>
          {porCategoria.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>Sem despesas neste mês.</Typography>
          ) : (
            <PieChart
              height={280}
              series={[{ data: porCategoria, innerRadius: 50, paddingAngle: 2, cornerRadius: 4, valueFormatter: ({ value }) => formatarMoeda(value) }]}
              slotProps={{ legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } } }}
            />
          )}
        </Paper>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Últimas movimentações</Typography>
          <Button component={LinkRouter} to="/movimentacoes" color="inherit" size="small" endIcon={<ArrowRight size={16} />}>Ver todas</Button>
        </Stack>
        {carregado && recentes.length === 0 && !erro && (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>Você ainda não cadastrou nenhuma movimentação.</Typography>
        )}
        <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
          {recentes.map((item) => (
            <Stack key={item.id_movimentacao} direction="row" spacing={2} sx={{ py: 1.5, alignItems: 'center' }}>
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
    </Stack>
  );
}
