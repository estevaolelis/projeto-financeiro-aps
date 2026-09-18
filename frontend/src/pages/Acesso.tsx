import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Divider, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { ArrowRight, CheckCircle2, LockKeyhole, UserPlus } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { cadastrar, entrar, estaAutenticado, salvarSessao } from '../services/api';

type Modo = 'entrada' | 'cadastro';

export default function Acesso() {
  const navegar = useNavigate();
  const [modo, definirModo] = useState<Modo>('entrada');
  const [nome, definirNome] = useState('');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [erro, definirErro] = useState('');
  const [sucesso, definirSucesso] = useState('');
  const [carregando, definirCarregando] = useState(false);

  if (estaAutenticado()) {
    return <Navigate to="/" replace />;
  }

  function alterarModo(_: unknown, proximoModo: Modo) {
    definirModo(proximoModo);
    definirErro('');
    definirSucesso('');
  }

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    definirErro('');
    definirSucesso('');
    definirCarregando(true);
    try {
      if (modo === 'cadastro') {
        await cadastrar(nome, email, senha);
        definirModo('entrada');
        definirSenha('');
        definirSucesso('Cadastro realizado. Agora entre com seus dados.');
      } else {
        const sessao = await entrar(email, senha);
        salvarSessao(sessao);
        navegar('/');
      }
    } catch (erroRequisicao) {
      definirErro(erroRequisicao instanceof Error ? erroRequisicao.message : 'Não foi possível concluir a operação.');
    } finally {
      definirCarregando(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 1080, minHeight: 'calc(100vh - 220px)', mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 420px' }, gap: { xs: 4, md: 10 }, alignItems: 'center' }}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.22em', fontWeight: 700 }}>Sua vida financeira, com clareza</Typography>
        <Typography variant="h2" sx={{ mt: 1, maxWidth: 600 }}>Um lugar seguro para cuidar dos seus planos.</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3, maxWidth: 560, fontWeight: 400, lineHeight: 1.6 }}>Crie sua conta para acompanhar suas decisões financeiras e manter seus dados organizados em um só lugar.</Typography>
      </Box>
      <Paper elevation={8} sx={{ p: { xs: 3, sm: 4 } }}>
        <Tabs value={modo} onChange={alterarModo} variant="fullWidth" sx={{ mb: 4 }}><Tab value="entrada" label="Entrar" /><Tab value="cadastro" label="Criar conta" /></Tabs>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{modo === 'entrada' ? 'Bem-vindo de volta' : 'Comece sua jornada'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>{modo === 'entrada' ? 'Entre para acessar seu espaço financeiro.' : 'Preencha seus dados para criar seu acesso.'}</Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" onSubmit={enviarFormulario}><Stack spacing={2}>
          {modo === 'cadastro' && <TextField required label="Nome" value={nome} onChange={(evento) => definirNome(evento.target.value)} slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }} placeholder="Como podemos chamar você?" />}
          <TextField required type="email" label="E-mail" value={email} onChange={(evento) => definirEmail(evento.target.value)} placeholder="voce@email.com" />
          <TextField required type="password" label="Senha" value={senha} onChange={(evento) => definirSenha(evento.target.value)} slotProps={{ htmlInput: { minLength: modo === 'cadastro' ? 8 : 1, maxLength: 72 } }} placeholder={modo === 'cadastro' ? 'Mínimo de 8 caracteres' : 'Sua senha'} />
          {erro && <Alert role="alert" severity="error">{erro}</Alert>}
          {sucesso && <Alert role="status" severity="success">{sucesso}</Alert>}
          <Button type="submit" disabled={carregando} variant="contained" size="large" endIcon={!carregando && <ArrowRight size={18} />} startIcon={modo === 'entrada' ? <LockKeyhole size={18} /> : <UserPlus size={18} />}>{carregando ? 'Aguarde...' : modo === 'entrada' ? 'Entrar na conta' : 'Criar minha conta'}</Button>
        </Stack></Box>
      </Paper>
    </Box>
  );
}
