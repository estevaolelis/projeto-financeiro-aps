import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Button, Container, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography,
} from '@mui/material';
import { Calculator, HelpCircle, Menu, TrendingUp, UserCheck, Video, X } from 'lucide-react';
import { limparSessao, obterUsuarioArmazenado } from '../services/api';

const itensNavegacao = [
  { nome: 'Início', caminho: '/', icone: TrendingUp },
  { nome: 'Calculadora', caminho: '/calculadora', icone: Calculator },
  { nome: 'Perfil de Investidor', caminho: '/perfil', icone: UserCheck },
  { nome: 'Vídeos', caminho: '/videos', icone: Video },
  { nome: 'Dúvidas', caminho: '/perguntas', icone: HelpCircle },
];

export default function BarraNavegacao() {
  const navegar = useNavigate();
  const [menuMovelAberto, definirMenuMovelAberto] = useState(false);
  const usuario = obterUsuarioArmazenado();
  const fecharMenuMovel = () => definirMenuMovelAberto(false);
  const sair = () => { limparSessao(); navegar('/acesso'); };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default', backdropFilter: 'blur(12px)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 3 }}>
          <Typography component={NavLink} to="/" variant="h6" sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 800, mr: 'auto' }}>
            Finanças<span style={{ color: '#7c83ff' }}>.</span>
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {itensNavegacao.map(({ nome, caminho, icone: Icone }) => (
              <Button key={caminho} component={NavLink} to={caminho} startIcon={<Icone size={17} />} sx={{ color: 'text.secondary', '&.active': { color: 'primary.main', bgcolor: 'rgba(124,131,255,.12)' } }}>
                {nome}
              </Button>
            ))}
          </Stack>
          {usuario ? <Button onClick={sair} color="inherit">Sair</Button> : <Button component={NavLink} to="/acesso" variant="contained" startIcon={<UserCheck size={17} />}>Entrar</Button>}
          <IconButton onClick={() => definirMenuMovelAberto(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label="Abrir menu">
            <Menu />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={menuMovelAberto} onClose={fecharMenuMovel}>
        <Box sx={{ width: 280, pt: 1 }} role="presentation">
          <Stack direction="row" sx={{ justifyContent: 'flex-end', px: 1 }}>
            <IconButton onClick={fecharMenuMovel} aria-label="Fechar menu"><X /></IconButton>
          </Stack>
          <List>
            {itensNavegacao.map(({ nome, caminho, icone: Icone }) => (
              <ListItem key={caminho} disablePadding>
                <ListItemButton component={NavLink} to={caminho} onClick={fecharMenuMovel}>
                  <ListItemIcon><Icone size={19} /></ListItemIcon>
                  <ListItemText primary={nome} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
