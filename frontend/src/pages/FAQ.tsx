import { useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { ChevronDown, Search } from 'lucide-react';
import { CATEGORIAS_DUVIDA, DUVIDAS } from '../data/duvidas';
import type { CategoriaDuvida } from '../data/duvidas';

const semAcento = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function PerguntasFrequentes() {
  const [busca, definirBusca] = useState('');
  const [categoria, definirCategoria] = useState<CategoriaDuvida | null>(null);
  const [aberta, definirAberta] = useState<string | false>(false);

  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    return DUVIDAS.filter((duvida) =>
      (!categoria || duvida.categoria === categoria)
      && (termo === '' || semAcento(`${duvida.pergunta} ${duvida.resposta}`).includes(termo)));
  }, [busca, categoria]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Perguntas frequentes</Typography>
        <Typography color="text.secondary">Principais dúvidas e respostas sobre finanças e sobre o uso do sistema.</Typography>
      </Box>

      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder="Buscar por uma dúvida (ex.: reserva, juros, orçamento)"
          value={busca}
          onChange={(evento) => definirBusca(evento.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }, htmlInput: { 'aria-label': 'Buscar nas perguntas frequentes' } }}
        />
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Todas" clickable color={categoria === null ? 'primary' : 'default'} variant={categoria === null ? 'filled' : 'outlined'} onClick={() => definirCategoria(null)} />
          {CATEGORIAS_DUVIDA.map((nome) => (
            <Chip key={nome} label={nome} clickable color={categoria === nome ? 'primary' : 'default'} variant={categoria === nome ? 'filled' : 'outlined'} onClick={() => definirCategoria(categoria === nome ? null : nome)} />
          ))}
        </Stack>
      </Stack>

      {filtradas.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>Nenhuma dúvida encontrada. Tente outras palavras ou limpe o filtro.</Paper>
      ) : (
        <Box>
          {filtradas.map((duvida) => (
            <Accordion
              key={duvida.pergunta}
              expanded={aberta === duvida.pergunta}
              onChange={(_, expandida) => definirAberta(expandida ? duvida.pergunta : false)}
              disableGutters
              sx={{ border: 1, borderColor: 'divider', borderRadius: 3, mb: 1, '&:before': { display: 'none' }, '&.Mui-expanded': { borderColor: 'primary.main' } }}
            >
              <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2.5, py: 0.5 }}>
                <Stack spacing={0.25}>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>{duvida.categoria}</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{duvida.pergunta}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{duvida.resposta}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Stack>
  );
}
