import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cadastrarCategoria, listarCategorias } from '../services/categorias';
import type { Categoria, TipoMovimentacao } from '../services/categorias';
import {
  cadastrarMovimentacao, editarMovimentacao, excluirMovimentacao, listarMovimentacoes,
} from '../services/movimentacoes';
import type { DadosMovimentacao, Movimentacao, NaturezaMovimentacao } from '../services/movimentacoes';

type Filtro = 'TODOS' | TipoMovimentacao;

const NOVA_CATEGORIA = 'nova';

const formatarMoeda = (valor: string | number) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (data: string) => data.split('-').reverse().join('/');

const hoje = () => new Date().toLocaleDateString('sv-SE');

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
  const [movimentacoes, definirMovimentacoes] = useState<Movimentacao[]>([]);
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [filtro, definirFiltro] = useState<Filtro>('TODOS');
  const [erro, definirErro] = useState('');
  const [erroFormulario, definirErroFormulario] = useState('');
  const [dialogoAberto, definirDialogoAberto] = useState(false);
  const [idEdicao, definirIdEdicao] = useState<number | null>(null);
  const [formulario, definirFormulario] = useState(formularioVazio());
  const [salvando, definirSalvando] = useState(false);
  const [exclusao, definirExclusao] = useState<Movimentacao | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [listaMovimentacoes, listaCategorias] = await Promise.all([listarMovimentacoes(), listarCategorias()]);
      definirMovimentacoes(listaMovimentacoes);
      definirCategorias(listaCategorias);
      definirErro('');
    } catch (erroRequisicao) {
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível carregar os dados.');
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const visiveis = useMemo(
    () => movimentacoes.filter((item) => filtro === 'TODOS' || item.tipo === filtro),
    [movimentacoes, filtro],
  );
  const totais = useMemo(() => {
    const somar = (tipo: TipoMovimentacao) =>
      movimentacoes.filter((item) => item.tipo === tipo).reduce((soma, item) => soma + Number(item.valor), 0);
    const receitas = somar('RECEITA');
    const despesas = somar('DESPESA');
    return { receitas, despesas, saldo: receitas - despesas };
  }, [movimentacoes]);
  const categoriasDoTipo = categorias.filter((categoria) => categoria.tipo === formulario.tipo);

  function atualizar<K extends keyof ReturnType<typeof formularioVazio>>(campo: K, valor: ReturnType<typeof formularioVazio>[K]) {
    definirFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrirNova() {
    definirIdEdicao(null);
    definirFormulario(formularioVazio(filtro === 'RECEITA' ? 'RECEITA' : 'DESPESA'));
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

      <ToggleButtonGroup exclusive size="small" value={filtro} onChange={(_, valor: Filtro | null) => valor && definirFiltro(valor)}>
        <ToggleButton value="TODOS">Todas</ToggleButton>
        <ToggleButton value="RECEITA">Receitas</ToggleButton>
        <ToggleButton value="DESPESA">Despesas</ToggleButton>
      </ToggleButtonGroup>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell>Categoria</TableCell>
              <TableCell>Classificação</TableCell><TableCell align="right">Valor</TableCell><TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visiveis.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Nenhuma movimentação cadastrada.</TableCell></TableRow>
            )}
            {visiveis.map((item) => (
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
