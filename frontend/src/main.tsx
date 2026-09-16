import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css'
import Aplicacao from './App.tsx'

const tema = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c83ff' },
    secondary: { main: '#5eead4' },
    background: { default: '#10121a', paper: '#191c27' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <Aplicacao />
    </ThemeProvider>
  </StrictMode>,
)
