import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import Aplicacao from './App.tsx'
import { tema } from './tema'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <Aplicacao />
    </ThemeProvider>
  </StrictMode>,
)
