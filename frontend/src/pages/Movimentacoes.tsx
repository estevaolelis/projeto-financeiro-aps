import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatarData, formatarMoeda, hoje } from '../utils/formatacao';
import { cadastrarCategoria, excluirCategoria, listarCategorias } from '../services/categorias';
import type { Categoria, TipoMovimentacao } from '../services/categorias';
import {
  cadastrarMovimentacao, editarMovimentacao, excluirMovimentacao, listarMovimentacoes, resumirMovimentacoes,
} from '../services/movimentacoes';
import type { DadosMovimentacao, FiltrosMovimentacao, Movimentacao, NaturezaMovimentacao, ResumoMovimentacoes } from '../services/movimentacoes';

const FILTROS_VAZIOS: FiltrosMovimentacao = { tipo: '', id_categoria: '', data_inicio: '', data_fim: '' };

const NOVA_CATEGORIA = 'nova';

// Cada página traz 30 itens; pedimos um a mais só para saber se existe uma próxima.
const TAMANHO_PAGINA = 30;
const RESUMO_VAZIO: ResumoMovimentacoes = { receitas: '0', despesas: '0', quantidade: 0 };

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
  const [resumo, definirResumo] = useState<ResumoMovimentacoes>(RESUMO_VAZIO);
  const [temMais, definirTemMais] = useState(false);
  const [carregandoMais, definirCarregandoMais] = useState(false);
  const [erroMais, definirErroMais] = useState(false);
  const geracao = useRef(0);
  const buscandoMais = useRef(false);
  const sentinela = useRef<HTMLDivElement | null>(null);
  const [categoriasAbertas, definirCategoriasAbertas] = useState(false);
  const [categoriaExclusao, definirCategoriaExclusao] = useState<Categoria | null>(null);

  // Recarrega do início (filtros novos ou dado alterado). `geracao` descarta respostas de buscas já superadas.
  const carregar = useCallback(async () => {
    const minhaGeracao = ++geracao.current;
    try {
      const [pagina, novoResumo, listaCategorias] = await Promise.all([
        listarMovimentacoes(filtros, { limite: TAMANHO_PAGINA + 1 }),
        resumirMovimentacoes(filtros),
        listarCategorias(),
      ]);
      if (minhaGeracao !== geracao.current) return;
      definirMovimentacoes(pagina.slice(0, TAMANHO_PAGINA));
      definirTemMais(pagina.length > TAMANHO_PAGINA);
      definirResumo(novoResumo);
      definirCategorias(listaCategorias);
      definirErroMais(false);
      definirErro('');
    } catch (erroRequisicao) {
      if (minhaGeracao !== geracao.current) return;
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível carregar os dados.');
    }
  }, [filtros]);

  const carregarMais = useCallback(async () => {
    const ultimo = movimentacoes[movimentacoes.length - 1];
    if (!ultimo || !temMais || buscandoMais.current) return;
    const minhaGeracao = geracao.current;
    buscandoMais.current = true;
    definirCarregandoMais(true);
    try {
      const pagina = await listarMovimentacoes(filtros, {
        limite: TAMANHO_PAGINA + 1,
        cursor: { data: ultimo.data_movimentacao, id: ultimo.id_movimentacao },
      });
      if (minhaGeracao !== geracao.current) return;
      definirMovimentacoes((atuais) => [...atuais, ...pagina.slice(0, TAMANHO_PAGINA)]);
      definirTemMais(pagina.length > TAMANHO_PAGINA);
    } catch {
      if (minhaGeracao === geracao.current) definirErroMais(true);
    } finally {
      buscandoMais.current = false;
      definirCarregandoMais(false);
    }
  }, [filtros, movimentacoes, temMais]);

  useEffect(() => { void carregar(); }, [carregar]);

  // Carrega a próxima página quando o fim da lista se aproxima da tela. O observador é recriado a cada
  // página recebida, então, se o fim ainda estiver visível (tela alta), ele dispara de novo sozinho.
  useEffect(() => {
    const alvo = sentinela.current;
    if (!alvo || !temMais || erroMais) return undefined;
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) void carregarMais();
    }, { rootMargin: '400px 0px' });
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [carregarMais, temMais, erroMais]);

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

  const totais = {
    receitas: Number(resumo.receitas),
    despesas: Number(resumo.despesas),
    saldo: Number(resumo.receitas) - Number(resumo.despesas),
  };
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

  // O valor exibido no campo fechado deve ser só o nome (sem o botão de excluir do item).
  const nomeCategoria = (valor: unknown) =>
    valor === NOVA_CATEGORIA ? '+ Nova categoria…' : categorias.find((categoria) => categoria.id_categoria === valor)?.nome ?? '';

  const itemCategoria = (categoria: Categoria) => (
    <MenuItem key={categoria.id_categoria} value={categoria.id_categoria} sx={{ justifyContent: 'space-between', gap: 2 }}>
      {categoria.nome}
      <IconButton
        size="small"
        aria-label={`Excluir categoria ${categoria.nome}`}
        onMouseDown={(evento) => evento.stopPropagation()}
        onClick={(evento) => { evento.stopPropagation(); definirCategoriaExclusao(categoria); }}
      ><Trash2 size={16} /></IconButton>
    </MenuItem>
  );

  async function confirmarExclusaoCategoria() {
    if (!categoriaExclusao) return;
    try {
      await excluirCategoria(categoriaExclusao.id_categoria);
      if (filtros.id_categoria === categoriaExclusao.id_categoria) atualizarFiltro({ id_categoria: '' });
      definirCategoriaExclusao(null);
      await carregar();
    } catch (erroRequisicao) {
      definirCategoriaExclusao(null);
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível excluir a categoria.');
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Receitas e despesas</Typography>
          <Typography color="text.secondary">Cadastre e acompanhe suas movimentações financeiras.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" startIcon={<Tags size={18} />} onClick={() => definirCategoriasAbertas(true)}>Categorias</Button>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={abrirNova}>Nova movimentação</Button>
        </Stack>
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
          <TextField select size="small" label="Categoria" value={filtros.id_categoria} onChange={(evento) => atualizarFiltro({ id_categoria: evento.target.value === '' ? '' : Number(evento.target.value) })} slotProps={{ select: { renderValue: nomeCategoria } }}>
            <MenuItem value="">Todas</MenuItem>
            {categoriasFiltraveis.map(itemCategoria)}
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

      <Box ref={sentinela} sx={{ minHeight: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {carregandoMais && <CircularProgress size={24} aria-label="Carregando mais movimentações" />}
        {erroMais && <Button onClick={() => { definirErroMais(false); void carregarMais(); }}>Não foi possível carregar mais. Tentar novamente</Button>}
        {!temMais && movimentacoes.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {resumo.quantidade === 1 ? '1 movimentação' : `${resumo.quantidade} movimentações`} · fim da lista
          </Typography>
        )}
      </Box>

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
              <TextField required select label="Categoria" value={formulario.id_categoria} onChange={(evento) => atualizar('id_categoria', evento.target.value as number | typeof NOVA_CATEGORIA)} slotProps={{ select: { renderValue: nomeCategoria } }}>
                {categoriasDoTipo.map(itemCategoria)}
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

      <Dialog open={categoriasAbertas} onClose={() => definirCategoriasAbertas(false)} fullWidth maxWidth="xs">
        <DialogTitle>Categorias</DialogTitle>
        <DialogContent>
          {(['DESPESA', 'RECEITA'] as const).map((tipo) => (
            <Box key={tipo} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">{tipo === 'DESPESA' ? 'Despesas' : 'Receitas'}</Typography>
              {categorias.filter((categoria) => categoria.tipo === tipo).map((categoria) => (
                <Stack key={categoria.id_categoria} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>{categoria.nome}</Typography>
                  <IconButton size="small" aria-label={`Excluir categoria ${categoria.nome}`} onClick={() => definirCategoriaExclusao(categoria)}><Trash2 size={17} /></IconButton>
                </Stack>
              ))}
              {categorias.every((categoria) => categoria.tipo !== tipo) && <Typography variant="body2" color="text.secondary">Nenhuma categoria.</Typography>}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => definirCategoriasAbertas(false)} color="inherit">Fechar</Button></DialogActions>
      </Dialog>

      <Dialog open={categoriaExclusao !== null} onClose={() => definirCategoriaExclusao(null)}>
        <DialogTitle>Excluir categoria</DialogTitle>
        <DialogContent><Typography>Deseja excluir a categoria “{categoriaExclusao?.nome}”? As movimentações já registradas continuam no histórico, mas os orçamentos desta categoria serão removidos.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => definirCategoriaExclusao(null)} color="inherit">Cancelar</Button>
          <Button onClick={confirmarExclusaoCategoria} color="error" variant="contained">Excluir</Button>
        </DialogActions>
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
