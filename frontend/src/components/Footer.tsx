import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          © 2026 FinançasApp - Projeto de Educação Financeira
        </Typography>
      </Container>
    </Box>
  );
}