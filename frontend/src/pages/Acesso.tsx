import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Divider, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { ArrowRight, CheckCircle2, LockKeyhole, UserPlus } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, login, register, saveSession } from '../services/api';

type Mode = 'login' | 'register';

export default function Acesso() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  function changeMode(_: unknown, nextMode: Mode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(nome, email, senha);
        setMode('login');
        setSenha('');
        setSuccess('Cadastro realizado. Agora entre com seus dados.');
      } else {
        const session = await login(email, senha);
        saveSession(session);
        navigate('/');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível concluir a operação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 1080, minHeight: 'calc(100vh - 220px)', mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 420px' }, gap: { xs: 4, md: 10 }, alignItems: 'center' }}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.22em', fontWeight: 700 }}>Sua vida financeira, com clareza</Typography>
        <Typography variant="h2" sx={{ mt: 1, maxWidth: 600 }}>Um lugar seguro para cuidar dos seus planos.</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3, maxWidth: 560, fontWeight: 400, lineHeight: 1.6 }}>Crie sua conta para acompanhar suas decisões financeiras e manter seus dados organizados em um só lugar.</Typography>
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><CheckCircle2 size={20} color="#5eead4" /><Typography color="text.secondary">Seus dados ficam separados por usuário</Typography></Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><LockKeyhole size={20} color="#5eead4" /><Typography color="text.secondary">Senha armazenada com proteção</Typography></Stack>
        </Stack>
      </Box>
      <Paper elevation={8} sx={{ p: { xs: 3, sm: 4 } }}>
        <Tabs value={mode} onChange={changeMode} variant="fullWidth" sx={{ mb: 4 }}><Tab value="login" label="Entrar" /><Tab value="register" label="Criar conta" /></Tabs>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{mode === 'login' ? 'Bem-vindo de volta' : 'Comece sua jornada'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>{mode === 'login' ? 'Entre para acessar seu espaço financeiro.' : 'Preencha seus dados para criar seu acesso.'}</Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" onSubmit={handleSubmit}><Stack spacing={2}>
          {mode === 'register' && <TextField required label="Nome" value={nome} onChange={(event) => setNome(event.target.value)} slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }} placeholder="Como podemos chamar você?" />}
          <TextField required type="email" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" />
          <TextField required type="password" label="Senha" value={senha} onChange={(event) => setSenha(event.target.value)} slotProps={{ htmlInput: { minLength: mode === 'register' ? 8 : 1, maxLength: 72 } }} placeholder={mode === 'register' ? 'Mínimo de 8 caracteres' : 'Sua senha'} />
          {error && <Alert role="alert" severity="error">{error}</Alert>}
          {success && <Alert role="status" severity="success">{success}</Alert>}
          <Button type="submit" disabled={loading} variant="contained" size="large" endIcon={!loading && <ArrowRight size={18} />} startIcon={mode === 'login' ? <LockKeyhole size={18} /> : <UserPlus size={18} />}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'}</Button>
        </Stack></Box>
      </Paper>
    </Box>
  );
}