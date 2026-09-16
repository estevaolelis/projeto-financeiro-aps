import { Box, Paper, Typography } from '@mui/material';

export default function Inicio() {
  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}><Paper sx={{ p: { xs: 3, md: 6 } }}><Typography variant="overline" color="primary.light">Educação financeira</Typography><Typography variant="h2" sx={{ mt: 1 }}>Orientação financeira</Typography><Typography color="text.secondary" sx={{ mt: 2, maxWidth: 620 }}>Dicas e conteúdos para tomar decisões mais claras e construir uma relação saudável com o seu dinheiro.</Typography></Paper></Box>
  );
}
