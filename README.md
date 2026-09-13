# Projeto Financeiro APS

Este projeto é composto por um backend em FastAPI e um frontend em React + Vite.

## Estrutura do projeto

- backend/
- frontend/

## Requisitos

- Python 3.11+
- Node.js 18+
- npm
- Git

## 1) Clone o projeto

```bash
git clone <URL_DO_REPO>
cd projeto-financeiro-aps
```

## 2) Backend

Acesse a pasta do backend:

```bash
cd backend
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual no Windows:

```bash
.\.venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

A API estará disponível em:

- http://localhost:8000
- http://localhost:8000/docs

## 3) Frontend

Abra outro terminal e acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

O frontend estará disponível em:

- http://localhost:5173

## 4) Fluxo de execução recomendado

Abra 2 terminais:

### Terminal 1 - Backend
```bash
cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## 5) Observações

- O backend está configurado para aceitar requisições do frontend com CORS.
- O frontend deve apontar para a API em `http://localhost:8000` ou conforme a configuração do serviço.
- Em ambiente Windows, caso `python` não esteja no PATH, use `py`:

```bash
py -m venv .venv
```

## 6) Dicas

- Para parar a execução, use `Ctrl + C` nos terminais.
- Sempre ative o ambiente virtual do backend antes de instalar dependências ou iniciar a API.

## 7) Próximos passos

- Criar modelos do banco
- Adicionar rotas e serviços
- Implementar autenticação
- Conectar frontend com backend

## 8) MySQL com Docker Compose

Instale o Docker Desktop e confirme que ele está em execução. Na raiz do
projeto, crie o arquivo local de configuração:

```powershell
Copy-Item .env.example .env
```

Edite o `.env`, substitua as duas senhas e o `JWT_SECRET` de exemplo e inicie o banco:

```powershell
docker compose up -d
```

Na primeira inicialização, o Compose cria as tabelas automaticamente a partir
de `backend/database/init.sql`. Esse script só é executado quando o volume do
MySQL ainda está vazio.

Para conferir o estado e acompanhar os logs:

```powershell
docker compose ps
docker compose logs -f mysql
```

O MySQL ficará disponível em `localhost:3307`, usando o banco e o usuário
definidos no `.env`. O volume `mysql_data` preserva os dados quando o container
for parado ou recriado.

Se a senha tiver caracteres especiais como `/`, `@` ou `#`, eles precisam ser
codificados na `DATABASE_URL` (por exemplo, `/` vira `%2F`).

Para parar o banco sem apagar os dados:

```powershell
docker compose down
```

Para apagar também o volume e todos os dados do banco, use
`docker compose down --volumes` somente quando essa exclusão for intencional.

Se o container já foi iniciado antes da criação ou alteração do `init.sql`,
recrie o banco para executar o script desde o início:

```powershell
docker compose down --volumes
docker compose up -d
docker compose ps
```
