import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  LinearProgress, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { formatarMoeda } from '../utils/formatacao';
import { listarCategorias } from '../services/categorias';
import type { Categoria } from '../services/categorias';
import { cadastrarOrcamento, editarOrcamento, excluirOrcamento, listarOrcamentos } from '../services/orcamentos';
import type { Orcamento } from '../services/orcamentos';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const corDoProgresso = (orcamento: Orcamento) => {
  const percentual = Number(orcamento.percentual_utilizado);
  if (percentual >= 100) return 'error';
  return percentual >= Number(orcamento.percentual_alerta) ? 'warning' : 'success';
};

export default function Orcamentos() {
  const dataAtual = new Date();
  const [mes, definirMes] = useState(dataAtual.getMonth() + 1);
  const [ano, definirAno] = useState(dataAtual.getFullYear());
  const [orcamentos, definirOrcamentos] = useState<Orcamento[]>([]);
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [erro, definirErro] = useState('');
  const [erroFormulario, definirErroFormulario] = useState('');
  const [dialogoAberto, definirDialogoAberto] = useState(false);
  const [idEdicao, definirIdEdicao] = useState<number | null>(null);
  const [idCategoria, definirIdCategoria] = useState<number | ''>('');
  const [valorLimite, definirValorLimite] = useState('');
  const [salvando, definirSalvando] = useState(false);
  const [exclusao, definirExclusao] = useState<Orcamento | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [listaOrcamentos, listaCategorias] = await Promise.all([listarOrcamentos(mes, ano), listarCategorias()]);
      definirOrcamentos(listaOrcamentos);
      definirCategorias(listaCategorias.filter((categoria) => categoria.tipo === 'DESPESA'));
      definirErro('');
    } catch (erroRequisicao) {
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível carregar os orçamentos.');
    }
  }, [mes, ano]);

  useEffect(() => { void carregar(); }, [carregar]);

  const categoriasDisponiveis = categorias.filter(
    (categoria) => !orcamentos.some((orcamento) => orcamento.id_categoria === categoria.id_categoria),
  );

  function abrirNovo() {
    definirIdEdicao(null);
    definirIdCategoria('');
    definirValorLimite('');
    definirErroFormulario('');
    definirDialogoAberto(true);
  }

  function abrirEdicao(orcamento: Orcamento) {
    definirIdEdicao(orcamento.id_orcamento);
    definirIdCategoria(orcamento.id_categoria);
    definirValorLimite(String(orcamento.valor_limite));
    definirErroFormulario('');
    definirDialogoAberto(true);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (idCategoria === '') return;
    definirErroFormulario('');
    definirSalvando(true);
    try {
      const limite = valorLimite.replace(',', '.');
      if (idEdicao === null) await cadastrarOrcamento({ id_categoria: idCategoria, mes, ano, valor_limite: limite });
      else await editarOrcamento(idEdicao, limite);
      definirDialogoAberto(false);
      await carregar();
    } catch (erroRequisicao) {
      definirErroFormulario(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível salvar.');
    } finally {
      definirSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!exclusao) return;
    try {
      await excluirOrcamento(exclusao.id_orcamento);
      definirExclusao(null);
      await carregar();
    } catch (erroRequisicao) {
      definirExclusao(null);
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível excluir.');
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Orçamento mensal</Typography>
          <Typography color="text.secondary">Defina limites de gastos por categoria e acompanhe o consumo.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={abrirNovo} disabled={categoriasDisponiveis.length === 0}>Novo orçamento</Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField select size="small" label="Mês" value={mes} onChange={(evento) => definirMes(Number(evento.target.value))} sx={{ minWidth: 160 }}>
          {MESES.map((nome, indice) => <MenuItem key={nome} value={indice + 1}>{nome}</MenuItem>)}
        </TextField>
        <TextField size="small" type="number" label="Ano" value={ano} sx={{ width: 110 }}
          onChange={(evento) => { const valor = Number(evento.target.value); if (valor >= 2000 && valor <= 9999) definirAno(valor); }} />
      </Stack>

      {erro && <Alert severity="error">{erro}</Alert>}

      {orcamentos.length === 0 && !erro && (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          {categorias.length === 0 ? 'Cadastre uma categoria de despesa em Movimentações para criar orçamentos.' : 'Nenhum orçamento definido para este mês.'}
        </Paper>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {orcamentos.map((orcamento) => {
          const percentual = Number(orcamento.percentual_utilizado);
          const estourado = Number(orcamento.valor_restante) < 0;
          return (
            <Paper key={orcamento.id_orcamento} sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{orcamento.nome_categoria}</Typography>
                  <Box>
                    <IconButton size="small" aria-label="Editar" onClick={() => abrirEdicao(orcamento)}><Pencil size={17} /></IconButton>
                    <IconButton size="small" aria-label="Excluir" onClick={() => definirExclusao(orcamento)}><Trash2 size={17} /></IconButton>
                  </Box>
                </Stack>
                <LinearProgress variant="determinate" value={Math.min(percentual, 100)} color={corDoProgresso(orcamento)} sx={{ height: 8, borderRadius: 4 }} />
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{percentual.toLocaleString('pt-BR')}% utilizado</Typography>
                  <Typography variant="body2" color="text.secondary">Limite {formatarMoeda(orcamento.valor_limite)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Box><Typography variant="caption" color="text.secondary">Gasto</Typography><Typography sx={{ fontWeight: 600 }}>{formatarMoeda(orcamento.valor_gasto)}</Typography></Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">{estourado ? 'Acima do limite' : 'Restante'}</Typography>
                    <Typography sx={{ fontWeight: 600 }} color={estourado ? 'error.main' : 'success.main'}>{formatarMoeda(Math.abs(Number(orcamento.valor_restante)))}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Box>

      <Dialog open={dialogoAberto} onClose={() => definirDialogoAberto(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={salvar}>
          <DialogTitle>{idEdicao === null ? 'Novo orçamento' : 'Editar orçamento'} — {MESES[mes - 1]}/{ano}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField required select label="Categoria" value={idCategoria} disabled={idEdicao !== null} onChange={(evento) => definirIdCategoria(Number(evento.target.value))}>
                {(idEdicao === null ? categoriasDisponiveis : categorias).map((categoria) => <MenuItem key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nome}</MenuItem>)}
              </TextField>
              <TextField required label="Limite mensal (R$)" value={valorLimite} onChange={(evento) => definirValorLimite(evento.target.value)} slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '\\d+([.,]\\d{1,2})?', title: 'Informe um valor maior que zero, ex.: 800,00' } }} />
              {erroFormulario && <Alert role="alert" severity="error">{erroFormulario}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => definirDialogoAberto(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={exclusao !== null} onClose={() => definirExclusao(null)}>
        <DialogTitle>Excluir orçamento</DialogTitle>
        <DialogContent><Typography>Deseja excluir o orçamento de “{exclusao?.nome_categoria}”? Esta ação não pode ser desfeita.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => definirExclusao(null)} color="inherit">Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
