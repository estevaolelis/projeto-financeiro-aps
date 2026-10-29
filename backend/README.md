# Backend MVC

Estrutura base para começar do zero com FastAPI em padrão MVC.

## Estrutura

- app/
  - __init__.py
  - config.py
  - database.py
  - main.py
  - controllers/ — adapta regras de negócio para HTTP
  - models/ — contratos de entrada e saída da API
  - routes/ — declara URLs, métodos e códigos de resposta
  - services/ — concentra regras de negócio e acesso aos dados
  - views/ — reservado para futuras respostas renderizadas

## Como iniciar

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:aplicacao --reload
```

As origens aceitas vêm de `ORIGENS_CORS` no `.env` (padrão: `http://localhost:5173`). A sessão usa um cookie `HttpOnly`; em desenvolvimento o frontend chama `/api` pelo proxy do Vite.

`SEGREDO_JWT` é obrigatório (mínimo de 32 caracteres): a API não sobe sem ele.
