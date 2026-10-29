import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Aplicacao from './App.tsx'
import ProvedorTema from './contexto/ProvedorTema'
import ProvedorSessao from './contexto/ProvedorSessao'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorTema>
      <ProvedorSessao>
        <Aplicacao />
      </ProvedorSessao>
    </ProvedorTema>
  </StrictMode>,
)
