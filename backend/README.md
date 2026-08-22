# Backend MVC

Estrutura base para começar do zero com FastAPI em padrão MVC.

## Estrutura

- app/
  - __init__.py
  - config.py
  - database.py
  - main.py
  - controllers/
  - models/
  - routes/
  - services/
  - views/

## Como iniciar

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

A API já está configurada para aceitar requisições do frontend em `http://localhost:5173` e `http://localhost:3000`.
