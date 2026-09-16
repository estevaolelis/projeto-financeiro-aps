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

A API já está configurada para aceitar requisições do frontend em `http://localhost:5173` e `http://localhost:3000`.
