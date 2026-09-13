import { Box, Paper, Typography } from '@mui/material';

export default function Videos() {
  return (
    <Box sx={{ py: 4 }}><Paper sx={{ p: 4 }}><Typography variant="h4">Vídeos recomendados</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Conteúdos e canais do YouTube sobre finanças.</Typography></Paper></Box>
  );
}