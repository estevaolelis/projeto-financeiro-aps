import { Box, Paper, Typography } from '@mui/material';

export default function PerfilInvestidor() {
  return (
    <Box sx={{ py: 4 }}><Paper sx={{ p: 4 }}><Typography variant="h4">Perfil de investidor</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Questionário para descobrir seu perfil de risco.</Typography></Paper></Box>
  );
}