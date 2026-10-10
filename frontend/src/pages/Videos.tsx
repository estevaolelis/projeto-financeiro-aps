import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardActions, CardContent, Paper, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

type Orientacao = {
  titulo: string;
  texto: string;
  dicas: string[];
};

type Video = {
  titulo: string;
  canal: string;
  descricao: string;
  url: string; // cole o link do YouTube aqui
};

const orientacoes: Orientacao[] = [
  {
    titulo: 'Organize seus gastos',
    texto:
      'Antes de investir, é preciso saber para onde o dinheiro está indo. Registrar receitas e despesas mostra onde dá para economizar.',
    dicas: [
      'Anote todos os gastos, inclusive os pequenos, durante pelo menos um mês.',
      'Separe o que é essencial (moradia, alimentação, transporte) do que é opcional.',
      'Uma referência comum é a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupar ou investir. Ajuste os percentuais à sua realidade.',
    ],
  },
  {
    titulo: 'Monte uma reserva de emergência',
    texto:
      'A reserva é um dinheiro guardado para imprevistos, como perda de renda ou despesas médicas, e evita que você precise recorrer a dívidas.',
    dicas: [
      'Uma meta comum é guardar de 3 a 6 meses do seu custo de vida mensal. Quem tem renda variável costuma buscar um valor maior.',
      'Deixe a reserva em aplicações seguras e com liquidez diária, para poder resgatar quando precisar.',
      'Comece com um valor pequeno e crie o hábito de depositar todo mês.',
    ],
  },
  {
    titulo: 'Cuidado com dívidas e juros',
    texto:
      'Juros altos corroem o orçamento rapidamente. Dívidas de cartão de crédito rotativo e cheque especial estão entre as mais caras.',
    dicas: [
      'Priorize quitar as dívidas com juros mais altos primeiro.',
      'Evite pagar apenas o valor mínimo da fatura do cartão.',
      'Antes de parcelar uma compra, confira o valor total com juros e se ela cabe no orçamento.',
    ],
  },
  {
    titulo: 'Entenda os juros compostos',
    texto:
      'Nos juros compostos, o rendimento de cada período é somado ao valor investido e passa a render também. Por isso o tempo é um dos fatores mais importantes ao investir.',
    dicas: [
      'Começar cedo, mesmo com valores pequenos, costuma pesar mais do que começar tarde com valores grandes.',
      'Aportes mensais constantes fazem diferença no longo prazo.',
      'Use a Calculadora do site para simular quanto um valor pode render ao longo do tempo.',
    ],
  },
  {
    titulo: 'Conheça os primeiros investimentos',
    texto:
      'Para quem está começando, existem opções de renda fixa com risco menor, como o Tesouro Direto e os CDBs. Cada uma tem prazo, rentabilidade e liquidez diferentes.',
    dicas: [
      'Compare rentabilidade, prazo de vencimento e liquidez antes de escolher.',
      'Em muitos investimentos bancários, como CDBs, existe a garantia do FGC dentro de um limite por CPF e por instituição. Confira as regras atuais no site do FGC.',
      'Desconfie de promessas de retorno alto e garantido.',
    ],
  },
  {
    titulo: 'Diversifique e respeite seu perfil',
    texto:
      'Diversificar significa não concentrar todo o dinheiro em um único investimento, reduzindo o impacto de uma perda isolada. A escolha também deve respeitar o seu perfil de investidor.',
    dicas: [
      'Conheça sua tolerância ao risco e seus objetivos antes de investir (veja a página Perfil do Investidor).',
      'Defina o prazo de cada objetivo: curto, médio ou longo prazo.',
      'Rentabilidade passada não garante rentabilidade futura.',
    ],
  },
  {
    titulo: 'Proteja-se de golpes financeiros',
    texto:
      'Golpes costumam prometer ganhos fáceis e rápidos. Informação é a melhor defesa.',
    dicas: [
      'Desconfie de retornos muito acima do mercado e de pressão para decidir na hora.',
      'Nunca compartilhe senhas, códigos de verificação ou dados do cartão.',
      'Antes de investir, confirme se a empresa ou o produto é regulamentado pela CVM ou pelo Banco Central.',
    ],
  },
];

// Adicione aqui os vídeos escolhidos. O botão só aparece quando a url estiver preenchida.
const videos: Video[] = [
  {
    titulo: 'COMO MONTAR UMA CARTEIRA DE INVESTIMENTOS PARA INICIANTES (NA PRÁTICA)',
    canal: 'O Primo Rico',
    descricao: 'Descubra na prática o passo a passo definitivo para criar a sua primeira carteira de investimentos do zero, mesmo sendo iniciante.',
    url: 'https://youtu.be/eMDgWLWOX84?si=hwUC83DF5O0PD6xQ',
  },
  {
    titulo: 'FAÇA ISSO SEMPRE QUE RECEBER SEU SALÁRIO | Como organizar suas finanças e guardar dinheiro?',
    canal: 'Bruno Perini- Você MAIS Rico',
    descricao: 'Descubra como organizar suas finanças e guardar dinheiro sempre que receber seu salário.',
    url: 'https://youtu.be/C67qPfI8_hg?si=siQ36rJER06KkJFl',
  },
  {
    titulo: 'Renda fixa | O que é CDB, CDI, SELIC, LCA, LCI, LC, IPCA?',
    canal: 'Bruno Perini- Você MAIS Rico',
    descricao: 'Descubra o significado por trás dos principais investimentos do mercado e aprenda a escolher as melhores opções para o seu bolso.',
    url: 'https://youtu.be/kHJC3ioC-4o?si=cG51KPEiQu-1XY8g',
  },
];

export default function PaginaVideos() {
  return (
    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Orientações Financeiras</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Dicas gerais para organizar o dinheiro e começar a investir com mais segurança.
        </Typography>

        {orientacoes.map((item, indice) => (
          <Accordion key={item.titulo} defaultExpanded={indice === 0} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {item.titulo}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ mb: 1 }}>{item.texto}</Typography>
              <Box component="ul" sx={{ m: 0, pl: 3 }}>
                {item.dicas.map((dica) => (
                  <Typography component="li" key={dica} sx={{ mb: 0.5 }}>
                    {dica}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Conteúdo educativo. Não constitui recomendação de investimento.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Videos Recomendados</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Conteúdos e canais do YouTube sobre finanças.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {videos.map((video) => (
            <Card key={video.titulo} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {video.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {video.canal}
                </Typography>
                <Typography variant="body2">{video.descricao}</Typography>
              </CardContent>
              {video.url && (
                <CardActions>
                  <Button
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<PlayArrowIcon />}
                  >
                    Assistir no YouTube
                  </Button>
                </CardActions>
              )}
            </Card>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}