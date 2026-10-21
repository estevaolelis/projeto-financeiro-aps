import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Aplicacao from './App.tsx'
import ProvedorTema from './contexto/ProvedorTema'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorTema>
      <Aplicacao />
    </ProvedorTema>
  </StrictMode>,
)
