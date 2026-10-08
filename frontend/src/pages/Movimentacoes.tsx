import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatarData, formatarMoeda, hoje } from '../utils/formatacao';
import { cadastrarCategoria, listarCategorias } from '../services/categorias';
import type { Categoria, TipoMovimentacao } from '../services/categorias';
import {
  cadastrarMovimentacao, editarMovimentacao, excluirMovimentacao, listarMovimentacoes,
} from '../services/movimentacoes';
import type { DadosMovimentacao, FiltrosMovimentacao, Movimentacao, NaturezaMovimentacao } from '../services/movimentacoes';

const FILTROS_VAZIOS: FiltrosMovimentacao = { tipo: '', id_categoria: '', data_inicio: '', data_fim: '' };

const NOVA_CATEGORIA = 'nova';

const formularioVazio = (tipo: TipoMovimentacao = 'DESPESA') => ({
  tipo,
  natureza: 'VARIAVEL' as NaturezaMovimentacao,
  descricao: '',
  valor: '',
  data_movimentacao: hoje(),
  id_categoria: '' as number | '' | typeof NOVA_CATEGORIA,
  nova_categoria: '',
  observacao: '',
});

export default function Movimentacoes() {
  const localizacao = useLocation();
  const navegar = useNavigate();
  const [movimentacoes, definirMovimentacoes] = useState<Movimentacao[]>([]);
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [filtros, definirFiltros] = useState<FiltrosMovimentacao>(FILTROS_VAZIOS);
  const [erro, definirErro] = useState('');
  const [erroFormulario, definirErroFormulario] = useState('');
  const [dialogoAberto, definirDialogoAberto] = useState(false);
  const [idEdicao, definirIdEdicao] = useState<number | null>(null);
  const [formulario, definirFormulario] = useState(formularioVazio());
  const [salvando, definirSalvando] = useState(false);
  const [exclusao, definirExclusao] = useState<Movimentacao | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [listaMovimentacoes, listaCategorias] = await Promise.all([listarMovimentacoes(filtros), listarCategorias()]);
      definirMovimentacoes(listaMovimentacoes);
      definirCategorias(listaCategorias);
      definirErro('');
    } catch (erroRequisicao) {
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível carregar os dados.');
    }
  }, [filtros]);

  useEffect(() => { void carregar(); }, [carregar]);

  // Vindo do botão "Nova movimentação" da Home: abre o modal e limpa o sinal para não reabrir ao atualizar a página.
  useEffect(() => {
    if (localizacao.state?.abrirNova) {
      definirIdEdicao(null);
      definirFormulario(formularioVazio());
      definirErroFormulario('');
      definirDialogoAberto(true);
      navegar(localizacao.pathname, { replace: true, state: null });
    }
  }, [localizacao, navegar]);

  const totais = useMemo(() => {
    const somar = (tipo: TipoMovimentacao) =>
      movimentacoes.filter((item) => item.tipo === tipo).reduce((soma, item) => soma + Number(item.valor), 0);
    const receitas = somar('RECEITA');
    const despesas = somar('DESPESA');
    return { receitas, despesas, saldo: receitas - despesas };
  }, [movimentacoes]);
  const categoriasDoTipo = categorias.filter((categoria) => categoria.tipo === formulario.tipo);
  const categoriasFiltraveis = categorias.filter((categoria) => !filtros.tipo || categoria.tipo === filtros.tipo);
  const temFiltro = Object.values(filtros).some((valor) => valor !== '');

  function atualizarFiltro(parcial: Partial<FiltrosMovimentacao>) {
    definirFiltros((atual) => ({ ...atual, ...parcial }));
  }

  function atualizar<K extends keyof ReturnType<typeof formularioVazio>>(campo: K, valor: ReturnType<typeof formularioVazio>[K]) {
    definirFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrirNova() {
    definirIdEdicao(null);
    definirFormulario(formularioVazio(filtros.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA'));
    definirErroFormulario('');
    definirDialogoAberto(true);
  }

  function abrirEdicao(item: Movimentacao) {
    definirIdEdicao(item.id_movimentacao);
    definirFormulario({
      tipo: item.tipo,
      natureza: item.natureza,
      descricao: item.descricao,
      valor: String(item.valor),
      data_movimentacao: item.data_movimentacao,
      id_categoria: item.id_categoria,
      nova_categoria: '',
      observacao: item.observacao ?? '',
    });
    definirErroFormulario('');
    definirDialogoAberto(true);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirErroFormulario('');
    definirSalvando(true);
    try {
      let idCategoria = formulario.id_categoria;
      if (idCategoria === NOVA_CATEGORIA) {
        const criada = await cadastrarCategoria(formulario.nova_categoria.trim(), formulario.tipo);
        idCategoria = criada.id_categoria;
      }
      if (idCategoria === '') {
        definirErroFormulario('Selecione uma categoria.');
        return;
      }
      const dados: DadosMovimentacao = {
        id_categoria: idCategoria,
        descricao: formulario.descricao.trim(),
        tipo: formulario.tipo,
        natureza: formulario.natureza,
        valor: formulario.valor.replace(',', '.'),
        data_movimentacao: formulario.data_movimentacao,
        observacao: formulario.observacao.trim() || null,
      };
      if (idEdicao === null) await cadastrarMovimentacao(dados);
      else await editarMovimentacao(idEdicao, dados);
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
      await excluirMovimentacao(exclusao.id_movimentacao);
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Receitas e despesas</Typography>
          <Typography color="text.secondary">Cadastre e acompanhe suas movimentações financeiras.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={abrirNova}>Nova movimentação</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Paper sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">Receitas</Typography><Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>{formatarMoeda(totais.receitas)}</Typography></Paper>
        <Paper sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">Despesas</Typography><Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>{formatarMoeda(totais.despesas)}</Typography></Paper>
        <Paper sx={{ p: 2 }}><Typography color="text.secondary" variant="body2">Saldo</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{formatarMoeda(totais.saldo)}</Typography></Paper>
      </Box>

      {erro && <Alert severity="error">{erro}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr) auto' }, gap: 2, alignItems: 'center' }}>
          <TextField select size="small" label="Tipo" value={filtros.tipo}
            onChange={(evento) => atualizarFiltro({ tipo: evento.target.value as FiltrosMovimentacao['tipo'], id_categoria: '' })}>
            <MenuItem value="">Todos</MenuItem><MenuItem value="RECEITA">Receitas</MenuItem><MenuItem value="DESPESA">Despesas</MenuItem>
          </TextField>
          <TextField select size="small" label="Categoria" value={filtros.id_categoria} onChange={(evento) => atualizarFiltro({ id_categoria: evento.target.value === '' ? '' : Number(evento.target.value) })}>
            <MenuItem value="">Todas</MenuItem>
            {categoriasFiltraveis.map((categoria) => <MenuItem key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nome}</MenuItem>)}
          </TextField>
          <TextField size="small" type="date" label="De" value={filtros.data_inicio} onChange={(evento) => atualizarFiltro({ data_inicio: evento.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filtros.data_fim || undefined } }} />
          <TextField size="small" type="date" label="Até" value={filtros.data_fim} onChange={(evento) => atualizarFiltro({ data_fim: evento.target.value })} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filtros.data_inicio || undefined } }} />
          <Button color="inherit" disabled={!temFiltro} onClick={() => definirFiltros(FILTROS_VAZIOS)}>Limpar filtros</Button>
        </Box>
      </Paper>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell>Categoria</TableCell>
              <TableCell>Classificação</TableCell><TableCell align="right">Valor</TableCell><TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimentacoes.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>{temFiltro ? 'Nenhuma movimentação encontrada com estes filtros.' : 'Nenhuma movimentação cadastrada.'}</TableCell></TableRow>
            )}
            {movimentacoes.map((item) => (
              <TableRow key={item.id_movimentacao} hover>
                <TableCell>{formatarData(item.data_movimentacao)}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.nome_categoria}</TableCell>
                <TableCell><Chip size="small" variant="outlined" label={item.natureza === 'FIXA' ? 'Fixa' : 'Variável'} /></TableCell>
                <TableCell align="right" sx={{ color: item.tipo === 'RECEITA' ? 'success.main' : 'error.main', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {item.tipo === 'DESPESA' && '− '}{formatarMoeda(item.valor)}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" aria-label="Editar" onClick={() => abrirEdicao(item)}><Pencil size={17} /></IconButton>
                  <IconButton size="small" aria-label="Excluir" onClick={() => definirExclusao(item)}><Trash2 size={17} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogoAberto} onClose={() => definirDialogoAberto(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={salvar}>
          <DialogTitle>{idEdicao === null ? 'Nova movimentação' : 'Editar movimentação'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={2}>
                <TextField select fullWidth label="Tipo" value={formulario.tipo}
                  onChange={(evento) => definirFormulario((atual) => ({ ...atual, tipo: evento.target.value as TipoMovimentacao, id_categoria: '' }))}>
                  <MenuItem value="RECEITA">Receita</MenuItem><MenuItem value="DESPESA">Despesa</MenuItem>
                </TextField>
                <TextField select fullWidth label="Classificação" value={formulario.natureza} onChange={(evento) => atualizar('natureza', evento.target.value as NaturezaMovimentacao)}>
                  <MenuItem value="FIXA">Fixa</MenuItem><MenuItem value="VARIAVEL">Variável</MenuItem>
                </TextField>
              </Stack>
              <TextField required label="Descrição" value={formulario.descricao} onChange={(evento) => atualizar('descricao', evento.target.value)} slotProps={{ htmlInput: { minLength: 2, maxLength: 150 } }} />
              <Stack direction="row" spacing={2}>
                <TextField required fullWidth label="Valor (R$)" value={formulario.valor} onChange={(evento) => atualizar('valor', evento.target.value)} slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '\\d+([.,]\\d{1,2})?', title: 'Informe um valor maior que zero, ex.: 1500,50' } }} />
                <TextField required fullWidth type="date" label="Data" value={formulario.data_movimentacao} onChange={(evento) => atualizar('data_movimentacao', evento.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              </Stack>
              <TextField required select label="Categoria" value={formulario.id_categoria} onChange={(evento) => atualizar('id_categoria', evento.target.value as number | typeof NOVA_CATEGORIA)}>
                {categoriasDoTipo.map((categoria) => <MenuItem key={categoria.id_categoria} value={categoria.id_categoria}>{categoria.nome}</MenuItem>)}
                <MenuItem value={NOVA_CATEGORIA}>+ Nova categoria…</MenuItem>
              </TextField>
              {formulario.id_categoria === NOVA_CATEGORIA && (
                <TextField required label="Nome da nova categoria" value={formulario.nova_categoria} onChange={(evento) => atualizar('nova_categoria', evento.target.value)} slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }} />
              )}
              <TextField multiline minRows={2} label="Observação (opcional)" value={formulario.observacao} onChange={(evento) => atualizar('observacao', evento.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} />
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
        <DialogTitle>Excluir movimentação</DialogTitle>
        <DialogContent><Typography>Deseja excluir “{exclusao?.descricao}”? Esta ação não pode ser desfeita.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => definirExclusao(null)} color="inherit">Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
