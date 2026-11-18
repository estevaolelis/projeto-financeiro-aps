# Projeto Financeiro APS — Arquitetura e funcionamento do código

Aplicação web de finanças pessoais: registra receitas e despesas, define orçamentos por categoria, mostra um dashboard e oferece ferramentas de educação financeira (simuladores, perfil de investidor, FAQ). Todo o código, nomes e mensagens estão em português.

## 1. Visão geral

```
Navegador (React + Vite, :5173)
      │  fetch('/api/...', credentials: 'include')   ← cookie HttpOnly vai junto
      ▼
Proxy do Vite  ──►  FastAPI (Uvicorn, :8000)
                        │  routes → controllers → services → SQL
                        ▼
                    MySQL 8.4 (Docker, :3307)
```

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, React Router 7, Material UI 9, MUI X Charts, lucide-react |
| Backend | Python 3.11+, FastAPI, Pydantic 2, PyJWT, bcrypt, slowapi, mysql-connector-python |
| Banco | MySQL 8.4 em Docker Compose, esquema criado por `backend/database/init.sql` |

## 2. Estrutura de pastas

```
projeto-financeiro-aps/
├── compose.yaml              # sobe o MySQL (healthcheck + volume + init.sql)
├── .env.example              # variáveis de ambiente (copiar para .env)
├── backend/
│   ├── database/init.sql     # DDL das 4 tabelas
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # cria a API, middlewares e registra as rotas
│       ├── config.py         # lê o .env e valida o segredo do JWT
│       ├── database.py       # conexão MySQL (context manager)
│       ├── limitador.py      # rate limiter (slowapi)
│       ├── routes/           # URLs, métodos HTTP e status
│       ├── controllers/      # adaptam HTTP ↔ regras (erros → HTTPException)
│       ├── services/         # regras de negócio e SQL
│       └── models/           # contratos Pydantic de entrada e saída
└── frontend/src/
    ├── main.tsx              # raiz: ProvedorTema > ProvedorSessao > App
    ├── App.tsx               # rotas e RotaProtegida
    ├── pages/                # uma tela por rota
    ├── components/           # peças reutilizáveis
    ├── services/             # chamadas HTTP à API
    ├── utils/                # lógica pura (dashboard, simuladores, formatação)
    ├── contexto/             # sessão e tema (React Context)
    ├── data/                 # conteúdo estático (perguntas do perfil, FAQ)
    └── tema.ts               # design system sobre o MUI
```

## 3. Backend

### 3.1 Padrão em camadas

Cada funcionalidade (autenticação, movimentações, orçamentos) segue o mesmo caminho:

1. **Route** (`routes/*_route.py`): declara a URL, o método, o `response_model` e o status. Usa `add_api_route` apontando para funções do controller. Todas as URLs ficam sob `/api`.
2. **Controller** (`controllers/*_controller.py`): recebe a requisição, obtém o usuário logado e chama o service. Converte exceções de domínio (ex.: `ErroEmailJaCadastrado`) em `HTTPException` com o status certo (409, 401, 404…).
3. **Service** (`services/*_service.py`): regras de negócio e SQL parametrizado. Lança exceções próprias, sem conhecer HTTP.
4. **Model** (`models/*_model.py`): classes Pydantic que validam a entrada (tamanhos, `valor > 0`, mês 1–12) e definem o formato da resposta.

A "View" do MVC é o próprio frontend React; o backend só devolve JSON.

### 3.2 Arquivos principais

- [main.py](../backend/app/main.py): instancia o `FastAPI` (variável `aplicacao`), registra o limitador, um **middleware de verificação de Origin** (rejeita com 403 POST/PUT/PATCH/DELETE vindos de origem fora de `ORIGENS_CORS`, contra CSRF), o **CORS** restrito com credenciais e os três roteadores. Expõe também `/` e `/saude`.
- [config.py](../backend/app/config.py): classe `Configuracoes` lida do `.env`. A API **não inicia** se `SEGREDO_JWT` tiver menos de 32 caracteres. Outras variáveis: `URL_BANCO_DADOS`, `MINUTOS_EXPIRACAO_JWT` (60), `ORIGENS_CORS`, `COOKIE_SEGURO`, `DEPURACAO`.
- [database.py](../backend/app/database.py): `obter_conexao()` abre uma conexão `mysql.connector` a partir da URL e a fecha ao sair do `with`. Não há pool nem ORM; é SQL direto.
- [limitador.py](../backend/app/limitador.py): `Limiter` do slowapi, identificando o cliente pelo IP.

### 3.3 Autenticação (`auth_*`)

Endpoints: `POST /api/autenticacao/cadastro`, `/entrar`, `/sair` e `GET /eu`.

- **Cadastro** (limite 10/hora): valida com Pydantic (nome 2–100, e-mail válido, senha 8–72 bytes), gera hash **bcrypt** e insere. E-mail duplicado (erro MySQL 1062) vira 409.
- **Login** (limite 5/minuto): busca o usuário pelo e-mail e confere a senha. Se o e-mail não existe, compara contra um **hash fictício**, o que mantém o tempo e a mensagem iguais ("E-mail ou senha inválidos"). Em caso de sucesso gera um **JWT HS256** (`sub` = id do usuário, `exp`) e o grava num cookie `financeiro_sessao` com `HttpOnly`, `SameSite=Lax` e `Secure` configurável.
- **Sessão**: `obter_usuario_atual` (no controller) é uma dependência do FastAPI que lê o cookie, valida o JWT e carrega o usuário no banco. Todo endpoint protegido a usa. Sem cookie ou token inválido resulta em 401.
- **Sair**: apaga o cookie. **`/eu`**: devolve o usuário da sessão; o frontend o usa para saber se há login.

### 3.4 Movimentações e categorias

Arquivo central: [movimentacao_service.py](../backend/app/services/movimentacao_service.py).

- Helpers `_consultar` (SELECT, devolve dicts) e `_executar` (INSERT/UPDATE/DELETE, devolve `lastrowid` e `rowcount`). O service de orçamentos os reutiliza.
- **Categorias** têm tipo `RECEITA` ou `DESPESA`. A exclusão é **lógica** (`ativo = FALSE`), o que preserva o histórico de movimentações, e remove os orçamentos da categoria. Recriar uma categoria com o mesmo nome a **reativa**.
- **Listagem** (`GET /api/movimentacoes`): filtros opcionais por tipo, categoria e datas, ordenada por data e id decrescentes. Com `limite`, usa **paginação por cursor** (`cursor_data` + `cursor_id` do último item), cujo custo não cresce com a profundidade como o OFFSET.
- **Resumo** (`GET /api/movimentacoes/resumo`): totais de receitas, despesas e quantidade, com os mesmos filtros, calculados no banco (`SUM ... GROUP BY tipo`).
- Cada movimentação tem `natureza` (`FIXA` ou `VARIAVEL`) e `valor` em `Decimal`.
- Toda query filtra por `id_usuario` do token, então um usuário nunca acessa dados de outro.

### 3.5 Orçamentos

[orcamento_service.py](../backend/app/services/orcamento_service.py): um limite mensal por categoria de **despesa**. O valor gasto **não é guardado**: o `SELECT` o calcula com uma subquery que soma as despesas da categoria no mês/ano. Depois `_montar` deriva `valor_restante` e `percentual_utilizado`. Assim o número nunca fica defasado. Duplicidade (mesmo usuário, categoria, mês e ano) resulta em erro 409.

### 3.6 Banco de dados

[init.sql](../backend/database/init.sql) cria 4 tabelas:

| Tabela | Conteúdo | Restrições notáveis |
|---|---|---|
| `usuario` | nome, e-mail, `senha_hash` | e-mail único |
| `categoria` | nome, tipo, `ativo` | único por usuário + nome + tipo |
| `movimentacao` | descrição, tipo, natureza, valor, data, observação | `CHECK valor > 0` |
| `orcamento` | mês, ano, `valor_limite`, `percentual_alerta` (padrão 80) | único por usuário + categoria + mês + ano; `CHECK` mês 1–12 e alerta 0–100 |

Valores monetários são `DECIMAL(12,2)`. As chaves estrangeiras têm índices para consultas por usuário e data.

## 4. Frontend

### 4.1 Inicialização e rotas

- [main.tsx](../frontend/src/main.tsx) monta a árvore `ProvedorTema > ProvedorSessao > Aplicacao`.
- [App.tsx](../frontend/src/App.tsx) define o layout (barra, conteúdo, rodapé) e as rotas. `RotaProtegida` mostra um spinner enquanto a sessão carrega e redireciona para `/acesso` se não houver usuário. Só `/acesso` é pública.

| Rota | Página | Função |
|---|---|---|
| `/` | `Home.tsx` | Dashboard: filtro de período, KPIs com comparativo, gráficos, alertas |
| `/movimentacoes` | `Movimentacoes.tsx` | CRUD de movimentações e categorias, filtros, scroll infinito |
| `/orcamentos` | `Orcamentos.tsx` | Limites mensais com progresso |
| `/calculadora` | `Calculadora.tsx` | Juros compostos, reserva de emergência, quitação de dívidas |
| `/perfil` | `PerfilInvestidor.tsx` | Questionário de 7 perguntas e alocação sugerida |
| `/videos` | `Videos.tsx` | Orientações financeiras |
| `/perguntas` | `FAQ.tsx` | Perguntas frequentes por categoria |
| `/acesso` | `Acesso.tsx` | Cadastro e login |

### 4.2 Sessão e comunicação com a API

- [services/http.ts](../frontend/src/services/http.ts): `requisitar<T>` envolve o `fetch` com `credentials: 'include'` (para enviar o cookie), converte erros em `ErroHttp` (usando o `detail` da API) e `requisitarAutenticado` redireciona para `/acesso` em caso de 401. `VITE_URL_API` é opcional; sem ela as chamadas vão para `/api`, atendido pelo proxy do Vite ([vite.config.ts](../frontend/vite.config.ts)) até `localhost:8000`.
- [services/*.ts](../frontend/src/services): um arquivo por recurso (`auth`, `categorias`, `movimentacoes`, `orcamentos`) com tipos TypeScript e funções que chamam os endpoints.
- [contexto/ProvedorSessao.tsx](../frontend/src/contexto/ProvedorSessao.tsx): ao carregar, remove do `localStorage` qualquer token antigo e chama `/eu`. O **servidor é a fonte da verdade**, pois o JavaScript não consegue ler o cookie HttpOnly. Expõe `usuario`, `carregando`, `definirUsuario` e `sair` via o hook `useSessao`.

### 4.3 Tema (claro/escuro)

[tema.ts](../frontend/src/tema.ts) cria o tema MUI (`criarTema(modo)`) e as cores de destaque. [ProvedorTema.tsx](../frontend/src/contexto/ProvedorTema.tsx) escolhe o modo salvo no `localStorage`, ou a preferência do sistema, antes da primeira renderização (sem piscar), e oferece a função de alternar.

### 4.4 Lógica pura em `utils/`

- [dashboard.ts](../frontend/src/utils/dashboard.ts): períodos predefinidos (mês, 3, 6, 12 meses, ano, personalizado), `periodoAnterior` (período imediatamente anterior de mesmo tamanho, para o comparativo), `totais`, `variacao` em %, `serieTemporal` e `despesasPorCategoria` para os gráficos.
- [simuladores.ts](../frontend/src/utils/simuladores.ts): `jurosCompostos`, `mesesParaMeta`, `quitarDivida`, conversão de taxa anual para mensal equivalente por `(1+i)^(1/12) − 1` e `numero()`, que aceita "1.500,50" e "1500.50". Os simuladores rodam **inteiramente no navegador**, sem backend.
- [formatacao.ts](../frontend/src/utils/formatacao.ts): moeda (BRL), valores compactos e datas.

### 4.5 Páginas de destaque

- **Home**: busca movimentações e orçamentos, filtra o período atual e o anterior, calcula KPIs com variação (verde/vermelho) e desenha barras, linha e pizza com MUI X Charts. Mostra `AlertasOrcamento`.
- **Movimentações**: carrega páginas de 30 itens (`TAMANHO_PAGINA`) e usa um elemento "sentinela" observado para buscar a próxima página ao rolar. Um contador de "geração" (`geracao`) descarta respostas de buscas antigas quando os filtros mudam. Cria categorias no próprio formulário.
- **Orçamentos / AlertasOrcamento**: avisam quando o gasto passa do percentual de alerta e quando o limite é excedido.
- **PerfilInvestidor**: soma as respostas (1–4 cada) e classifica em Conservador (até 14), Moderado (até 21) ou Arrojado, com a alocação sugerida. As perguntas ficam em `data/perfilInvestidor.ts`.

## 5. Fluxos de ponta a ponta

**Login**
1. `Acesso.tsx` chama `entrar()` → `POST /api/autenticacao/entrar`.
2. O backend valida a senha, gera o JWT e o devolve no cookie HttpOnly junto com os dados do usuário.
3. O frontend guarda o usuário no contexto e navega. As chamadas seguintes enviam o cookie sozinhas.

**Registrar uma despesa**
1. Formulário em `Movimentacoes.tsx` → `cadastrarMovimentacao()` → `POST /api/movimentacoes`.
2. O Pydantic valida o corpo. O controller obtém o usuário pelo cookie. O service confere se a categoria é do usuário e do tipo correto, e insere.
3. Na próxima leitura, o orçamento da categoria já reflete o gasto, porque é calculado na consulta.

## 6. Segurança (resumo)

- Senhas com bcrypt; token JWT com expiração.
- Sessão em cookie `HttpOnly` + `SameSite=Lax` + `Secure`, e não em `localStorage`.
- Rate limiting no login e no cadastro.
- Verificação de `Origin` e CORS restrito (defesa contra CSRF).
- Resposta de login uniforme, sem revelar se o e-mail existe.
- SQL sempre parametrizado; toda consulta filtra por `id_usuario`.
- API não sobe sem segredo JWT forte.

## 7. Como executar

1. `cp .env.example .env`, troque as senhas e gere `SEGREDO_JWT` com `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
2. `docker compose up -d` (MySQL na porta 3307).
3. Backend: `cd backend`, crie e ative o venv, `pip install -r requirements.txt`, depois `uvicorn app.main:aplicacao --reload` (porta 8000, Swagger em `/docs`). Execute o uvicorn a partir de `backend/`, para que o pacote `app` seja encontrado.
4. Frontend: `cd frontend`, `npm install`, `npm run dev` (porta 5173).

## 8. Observações e limitações

- Não há testes automatizados no repositório.
- [Accordion.tsx](../frontend/src/components/Accordion.tsx) e [types/index.ts](../frontend/src/types/index.ts) estão vazios.
- Não há recuperação de senha, verificação de e-mail nem edição de perfil.
- Os simuladores não consideram impostos nem inflação.
- A pasta `backend/app/views/` foi removida (aparece como excluída no git), já que a view é o frontend.
