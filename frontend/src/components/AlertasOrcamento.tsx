import { Alert, Stack } from '@mui/material';
import { formatarMoeda } from '../utils/formatacao';
import type { Orcamento } from '../services/orcamentos';

export default function AlertasOrcamento({ orcamentos }: { orcamentos: Orcamento[] }) {
  const alertas = orcamentos
    .filter((orcamento) => Number(orcamento.percentual_utilizado) >= Number(orcamento.percentual_alerta))
    .sort((a, b) => Number(b.percentual_utilizado) - Number(a.percentual_utilizado));

  if (alertas.length === 0) return null;

  return (
    <Stack spacing={1}>
      {alertas.map((orcamento) => {
        const percentual = Number(orcamento.percentual_utilizado).toLocaleString('pt-BR');
        const excedido = Number(orcamento.valor_restante) < 0;
        return (
          <Alert key={orcamento.id_orcamento} severity={excedido ? 'error' : 'warning'}>
            {excedido
              ? `Orçamento de ${orcamento.nome_categoria} excedido: ${percentual}% utilizado, ${formatarMoeda(Math.abs(Number(orcamento.valor_restante)))} acima do limite de ${formatarMoeda(orcamento.valor_limite)}.`
              : `Orçamento de ${orcamento.nome_categoria} próximo do limite: ${percentual}% utilizado, restam ${formatarMoeda(orcamento.valor_restante)} de ${formatarMoeda(orcamento.valor_limite)}.`}
          </Alert>
        );
      })}
    </Stack>
  );
}
