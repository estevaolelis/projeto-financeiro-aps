import { useState } from 'react';
import {
  Alert, Box, Button, Chip, FormControl, FormControlLabel, LinearProgress, Paper, Radio, RadioGroup, Stack, Typography,
  alpha,
} from '@mui/material';
import { ArrowLeft, ArrowRight, RotateCcw, UserCheck } from 'lucide-react';
import { PERFIS, PERGUNTAS, classificar } from '../data/perfilInvestidor';
import type { PerfilId } from '../data/perfilInvestidor';

const CHAVE_ARMAZENAMENTO = 'financeiro_perfil_investidor';

const lerPerfilSalvo = (): PerfilId | null => {
  try {
    const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return salvo && salvo in PERFIS ? (salvo as PerfilId) : null;
  } catch {
    return null;
  }
};

const salvarPerfil = (perfil: PerfilId) => {
  try { localStorage.setItem(CHAVE_ARMAZENAMENTO, perfil); } catch { /* armazenamento indisponível: o resultado só não fica salvo */ }
};

function Resultado({ perfilId, aoRefazer }: { perfilId: PerfilId; aoRefazer: () => void }) {
  const perfil = PERFIS[perfilId];
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, borderColor: perfil.cor, background: `linear-gradient(135deg, ${perfil.cor}26, transparent 60%)` }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <UserCheck size={22} color={perfil.cor} />
          <Typography variant="overline" color="text.secondary">Seu perfil de investidor</Typography>
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 800, color: perfil.cor }}>{perfil.nome}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 640 }}>{perfil.resumo}</Typography>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 2 }}>
          {perfil.caracteristicas.map((item) => <Chip key={item} label={item} variant="outlined" />)}
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Distribuição de referência</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Um exemplo educativo de como carteiras desse perfil costumam ser divididas.</Typography>
          <Stack direction="row" spacing="2px" sx={{ height: 14, mb: 2 }}>
            {perfil.alocacao.map((faixa) => <Box key={faixa.classe} sx={{ flex: faixa.percentual, bgcolor: faixa.cor, borderRadius: '5px' }} />)}
          </Stack>
          <Stack spacing={1}>
            {perfil.alocacao.map((faixa) => (
              <Stack key={faixa.classe} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: faixa.cor }} />
                  <Typography variant="body2">{faixa.classe}</Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{faixa.percentual}%</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Produtos mais comuns</Typography>
          <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
            {perfil.produtos.map((produto) => <Typography key={produto} component="li" variant="body2" color="text.secondary">{produto}</Typography>)}
          </Stack>
        </Paper>
      </Box>

      <Alert severity="info">
        Este resultado tem caráter educativo e não é recomendação de investimento. Antes de investir, considere seus objetivos, sua reserva de emergência e, se necessário, procure um profissional certificado.
      </Alert>
      <Box><Button startIcon={<RotateCcw size={18} />} onClick={aoRefazer}>Refazer questionário</Button></Box>
    </Stack>
  );
}

export default function PerfilInvestidor() {
  const [perfilFinal, definirPerfilFinal] = useState<PerfilId | null>(lerPerfilSalvo);
  const [indice, definirIndice] = useState(0);
  const [respostas, definirRespostas] = useState<(number | null)[]>(() => PERGUNTAS.map(() => null));

  const pergunta = PERGUNTAS[indice];
  const respostaAtual = respostas[indice];
  const ultima = indice === PERGUNTAS.length - 1;

  function responder(pontos: number) {
    definirRespostas((atuais) => atuais.map((valor, posicao) => (posicao === indice ? pontos : valor)));
  }

  function avancar() {
    if (respostaAtual === null) return;
    if (!ultima) {
      definirIndice(indice + 1);
      return;
    }
    const perfil = classificar(respostas.reduce<number>((soma, valor) => soma + (valor ?? 0), 0));
    salvarPerfil(perfil);
    definirPerfilFinal(perfil);
  }

  function refazer() {
    definirRespostas(PERGUNTAS.map(() => null));
    definirIndice(0);
    definirPerfilFinal(null);
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Perfil de investidor</Typography>
        <Typography color="text.secondary">Responda {PERGUNTAS.length} perguntas rápidas para descobrir seu perfil de risco.</Typography>
      </Box>

      {perfilFinal ? <Resultado perfilId={perfilFinal} aoRefazer={refazer} /> : (
        <Paper sx={{ p: { xs: 3, sm: 4 }, maxWidth: 760 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Pergunta {indice + 1} de {PERGUNTAS.length}</Typography>
            <Typography variant="body2" color="text.secondary">{Math.round((indice / PERGUNTAS.length) * 100)}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={(indice / PERGUNTAS.length) * 100} sx={{ mb: 3, height: 6 }} />

          <FormControl sx={{ width: '100%' }}>
            <Typography id="pergunta" variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{pergunta.enunciado}</Typography>
            <RadioGroup aria-labelledby="pergunta" value={respostaAtual === null ? '' : String(respostaAtual)} onChange={(evento) => responder(Number(evento.target.value))}>
              <Stack spacing={1}>
                {pergunta.opcoes.map((opcao) => (
                  <FormControlLabel
                    key={opcao.texto}
                    value={String(opcao.pontos)}
                    control={<Radio />}
                    label={opcao.texto}
                    sx={{
                      m: 0, px: 1.5, py: 0.5, border: 1, borderRadius: 3, transition: 'border-color .15s, background-color .15s',
                      borderColor: respostaAtual === opcao.pontos ? 'primary.main' : 'divider',
                      bgcolor: (tema) => (respostaAtual === opcao.pontos ? alpha(tema.palette.primary.main, 0.12) : 'transparent'),
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  />
                ))}
              </Stack>
            </RadioGroup>
          </FormControl>

          <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 3 }}>
            <Button color="inherit" startIcon={<ArrowLeft size={18} />} disabled={indice === 0} onClick={() => definirIndice(indice - 1)}>Voltar</Button>
            <Button variant="contained" endIcon={<ArrowRight size={18} />} disabled={respostaAtual === null} onClick={avancar}>{ultima ? 'Ver meu perfil' : 'Próxima'}</Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
