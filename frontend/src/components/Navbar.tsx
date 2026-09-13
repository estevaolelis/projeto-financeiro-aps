import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Button, Container, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography,
} from '@mui/material';
import { Calculator, HelpCircle, Menu, TrendingUp, UserCheck, Video, X } from 'lucide-react';
import { clearSession, getStoredUser } from '../services/api';

const navItems = [
  { name: 'Início', path: '/', icon: TrendingUp },
  { name: 'Calculadora', path: '/calculadora', icon: Calculator },
  { name: 'Perfil de Investidor', path: '/perfil', icon: UserCheck },
  { name: 'Vídeos', path: '/videos', icon: Video },
  { name: 'Dúvidas', path: '/faq', icon: HelpCircle },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();
  const closeMobile = () => setMobileOpen(false);
  const logout = () => { clearSession(); navigate('/acesso'); };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default', backdropFilter: 'blur(12px)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 3 }}>
          <Typography component={NavLink} to="/" variant="h6" sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 800, mr: 'auto' }}>
            Finanças<span style={{ color: '#7c83ff' }}>.</span>
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map(({ name, path, icon: Icon }) => (
              <Button key={path} component={NavLink} to={path} startIcon={<Icon size={17} />} sx={{ color: 'text.secondary', '&.active': { color: 'primary.main', bgcolor: 'rgba(124,131,255,.12)' } }}>
                {name}
              </Button>
            ))}
          </Stack>
          {user ? <Button onClick={logout} color="inherit">Sair</Button> : <Button component={NavLink} to="/acesso" variant="contained" startIcon={<UserCheck size={17} />}>Entrar</Button>}
          <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label="Abrir menu">
            <Menu />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={mobileOpen} onClose={closeMobile}>
        <Box sx={{ width: 280, pt: 1 }} role="presentation">
          <Stack direction="row" sx={{ justifyContent: 'flex-end', px: 1 }}>
            <IconButton onClick={closeMobile} aria-label="Fechar menu"><X /></IconButton>
          </Stack>
          <List>
            {navItems.map(({ name, path, icon: Icon }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton component={NavLink} to={path} onClick={closeMobile}>
                  <ListItemIcon><Icon size={19} /></ListItemIcon>
                  <ListItemText primary={name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
