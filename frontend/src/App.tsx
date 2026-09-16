import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import BarraNavegacao from './components/Navbar';
import Rodape from './components/Footer';
import Inicio from './pages/Home';
import Calculadora from './pages/Calculadora';
import PerfilInvestidor from './pages/PerfilInvestidor';
import PaginaVideos from './pages/Videos';
import PerguntasFrequentes from './pages/FAQ';
import Acesso from './pages/Acesso';
import { estaAutenticado } from './services/api';

function RotaProtegida({ children: conteudo }: { children: ReactNode }) {
  return estaAutenticado() ? conteudo : <Navigate to="/acesso" replace />;
}

export default function Aplicacao() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <BarraNavegacao />
        <Container component="main" maxWidth="xl" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
          <Routes>
            <Route path="/" element={<RotaProtegida><Inicio /></RotaProtegida>} />
            <Route path="/calculadora" element={<RotaProtegida><Calculadora /></RotaProtegida>} />
            <Route path="/perfil" element={<RotaProtegida><PerfilInvestidor /></RotaProtegida>} />
            <Route path="/videos" element={<RotaProtegida><PaginaVideos /></RotaProtegida>} />
            <Route path="/perguntas" element={<RotaProtegida><PerguntasFrequentes /></RotaProtegida>} />
            <Route path="/acesso" element={<Acesso />} />
          </Routes>
        </Container>
        <Rodape />
      </Box>
    </BrowserRouter>
  );
}
