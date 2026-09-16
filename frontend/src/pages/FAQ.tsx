import { Box, Paper, Typography } from '@mui/material';

export default function PerguntasFrequentes() {
  return (
    <Box sx={{ py: 4 }}><Paper sx={{ p: 4 }}><Typography variant="h4">Perguntas frequentes</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Principais dúvidas e respostas sobre finanças.</Typography></Paper></Box>
  );
}
