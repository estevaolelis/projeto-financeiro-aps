export type CategoriaDuvida = 'Planejamento' | 'Investimentos' | 'Dívidas' | 'Usando o app';

export const CATEGORIAS_DUVIDA: CategoriaDuvida[] = ['Planejamento', 'Investimentos', 'Dívidas', 'Usando o app'];

export type Duvida = { categoria: CategoriaDuvida; pergunta: string; resposta: string };

export const DUVIDAS: Duvida[] = [
	{
		categoria: 'Planejamento',
		pergunta: 'O que é uma reserva de emergência e quanto devo ter?',
		resposta: 'É um dinheiro separado para imprevistos, como perda de renda, problemas de saúde ou um conserto urgente. A referência mais comum é de 3 a 6 meses das suas despesas essenciais; quem tem renda variável costuma buscar até 12 meses. Ela deve ficar em um investimento seguro e de resgate rápido, como Tesouro Selic ou CDB com liquidez diária. Use o simulador de Reserva de emergência para calcular a sua meta.',
	},
	{
		categoria: 'Planejamento',
		pergunta: 'Como funciona a regra 50/30/20?',
		resposta: 'É um método simples de dividir a renda líquida: 50% para necessidades (moradia, alimentação, transporte, saúde), 30% para desejos (lazer, assinaturas, restaurantes) e 20% para o futuro (reserva, investimentos e quitação de dívidas). É um ponto de partida: ajuste os percentuais à sua realidade e acompanhe pelos orçamentos por categoria.',
	},
	{
		categoria: 'Planejamento',
		pergunta: 'Qual a diferença entre despesa fixa e variável?',
		resposta: 'Despesas fixas têm valor igual ou muito parecido todo mês, como aluguel, plano de saúde e mensalidades. Variáveis mudam conforme o seu consumo, como supermercado, combustível e lazer. Saber a proporção ajuda a ver quanto do seu orçamento é "engessado" e onde há mais espaço para cortar. O dashboard mostra essa divisão no período escolhido.',
	},
	{
		categoria: 'Investimentos',
		pergunta: 'O que são juros compostos?',
		resposta: 'São juros calculados sobre o valor inicial mais os juros já acumulados, ou seja, "juros sobre juros". Por isso, o tempo é o grande aliado de quem investe: quanto mais longo o prazo e mais regulares os aportes, maior o efeito. O mesmo mecanismo age contra você em dívidas com juros altos. Teste valores no simulador de Juros compostos.',
	},
	{
		categoria: 'Investimentos',
		pergunta: 'O que são Selic e CDI?',
		resposta: 'A Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central, e serve de referência para quase todas as outras taxas. O CDI é a taxa de juros praticada entre bancos e acompanha de perto a Selic. Muitos investimentos de renda fixa informam sua rentabilidade como "% do CDI": um CDB que paga 100% do CDI rende aproximadamente o mesmo que a taxa básica.',
	},
	{
		categoria: 'Investimentos',
		pergunta: 'Qual a diferença entre renda fixa e renda variável?',
		resposta: 'Na renda fixa, a regra de remuneração é conhecida no momento da aplicação (por exemplo, um percentual do CDI ou uma taxa prefixada), como no Tesouro Direto e em CDBs. Na renda variável, como ações e fundos imobiliários, o retorno depende do mercado e pode ser negativo no curto prazo, em troca de potencial de ganho maior no longo prazo. Uma carteira equilibrada costuma combinar as duas, conforme o seu perfil de investidor.',
	},
	{
		categoria: 'Investimentos',
		pergunta: 'O que é o FGC e quando ele protege meu dinheiro?',
		resposta: 'O Fundo Garantidor de Créditos protege depósitos e alguns investimentos, como CDB, LCI, LCA e poupança, caso a instituição financeira quebre. A cobertura é de até R$ 250 mil por CPF, por instituição, com um teto global em um período de 4 anos. Ações, fundos de investimento e Tesouro Direto não são cobertos pelo FGC (o Tesouro conta com a garantia do governo federal).',
	},
	{
		categoria: 'Investimentos',
		pergunta: 'Pago imposto sobre os investimentos?',
		resposta: 'Em geral, sim. Na renda fixa há Imposto de Renda regressivo sobre o rendimento: quanto mais tempo o dinheiro fica aplicado, menor a alíquota. Alguns produtos, como LCI e LCA para pessoa física, têm isenção. Regras e alíquotas mudam com o tempo, então confirme sempre as condições vigentes com a corretora ou o banco antes de investir.',
	},
	{
		categoria: 'Dívidas',
		pergunta: 'Por onde começo a sair das dívidas?',
		resposta: 'Liste todas com saldo, taxa de juros e parcela. Priorize pagar primeiro as de juros mais altos (cartão de crédito rotativo e cheque especial costumam ser as piores), mantendo o mínimo nas demais. Negocie taxas e prazos, e evite criar novas dívidas enquanto quita as antigas. Simule cenários no simulador de Quitação de dívidas.',
	},
	{
		categoria: 'Dívidas',
		pergunta: 'Vale mais a pena investir ou quitar uma dívida?',
		resposta: 'Compare as taxas. Se a dívida cobra mais juros do que qualquer investimento seguro consegue render (o que é quase sempre verdade para cartão de crédito e cheque especial), quitá-la é o "investimento" de melhor retorno. Mantenha apenas uma pequena reserva de emergência para não precisar se endividar de novo diante de um imprevisto.',
	},
	{
		categoria: 'Dívidas',
		pergunta: 'Por que o rotativo do cartão é tão perigoso?',
		resposta: 'Porque os juros são muito altos e incidem sobre o saldo que sobrou, de forma composta: a dívida pode crescer rapidamente se você paga só o mínimo da fatura. Sempre que possível, pague o valor total; se não der, negocie o parcelamento da fatura, que costuma ter juros menores que o rotativo.',
	},
	{
		categoria: 'Usando o app',
		pergunta: 'Como cadastro uma receita ou despesa?',
		resposta: 'Vá em Movimentações e clique em "Nova movimentação". Escolha o tipo (receita ou despesa), a classificação (fixa ou variável), informe descrição, valor, data e categoria. Se a categoria ainda não existir, escolha "+ Nova categoria…" na própria lista.',
	},
	{
		categoria: 'Usando o app',
		pergunta: 'Como excluir uma categoria?',
		resposta: 'Em Movimentações, use o botão "Categorias" no topo da página (ou a lixeira ao lado de cada categoria nas listas) e confirme. As movimentações que já usavam a categoria continuam no histórico, mas os orçamentos dela são removidos.',
	},
	{
		categoria: 'Usando o app',
		pergunta: 'Como funcionam os orçamentos e os alertas?',
		resposta: 'Em Orçamentos, defina um limite mensal para uma categoria de despesa. O sistema soma automaticamente as despesas da categoria no mês, mostra o percentual usado e o valor restante. Quando o gasto chega a 80% do limite você recebe um aviso de aproximação, e acima de 100% um alerta de orçamento excedido, na página de Orçamentos e no Início.',
	},
	{
		categoria: 'Usando o app',
		pergunta: 'Como analiso meus gastos por período?',
		resposta: 'No Início (dashboard), escolha o período nos botões do topo: este mês, 3, 6 ou 12 meses, este ano, ou um intervalo personalizado. Indicadores e gráficos são recalculados, e as variações comparam com o período anterior de mesmo tamanho.',
	},
];
