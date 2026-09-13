import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Calculadora from './pages/Calculadora';
import PerfilInvestidor from './pages/PerfilInvestidor';
import Videos from './pages/Videos';
import FAQ from './pages/FAQ';
import Acesso from './pages/Acesso';
import { isAuthenticated } from './services/api';

function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/acesso" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Container component="main" maxWidth="xl" sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/calculadora" element={<ProtectedRoute><Calculadora /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><PerfilInvestidor /></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="/acesso" element={<Acesso />} />
          </Routes>
        </Container>
        <Footer />
      </Box>
    </BrowserRouter>
  );
}