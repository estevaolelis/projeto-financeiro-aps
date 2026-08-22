# 📘 Backend - Projeto de Educação Financeira (APS)

Este é o backend da aplicação de **Orientação e Educação Financeira**, desenvolvido em **Python** utilizando o framework **FastAPI**.

O projeto foi estruturado seguindo o padrão arquitetural **MVC (Model-View-Controller)** adaptado para **APIs REST**, garantindo alta separação de responsabilidades, código limpo, facilidade de manutenção e modularidade para o trabalho em equipe.

---

## 🧭 Sumário
- [1. Entendendo o Padrão MVC em APIs REST](#1-entendendo-o-padrão-mvc-em-apis-rest)
- [2. Estrutura de Pastas e Arquivos](#2-estrutura-de-pastas-e-arquivos)
- [3. Fluxo de uma Requisição (Passo a Passo)](#3-fluxo-de-uma-requisição-passo-a-passo)
- [4. Módulos do Sistema](#4-módulos-do-sistema)
- [5. Guia: Como Rodar o Projeto Localmente](#5-guia-como-rodar-o-projeto-localmente)
- [6. Testes Automatizados](#6-testes-automatizados)
- [7. Guia para a Equipe: Como Adicionar uma Nova Funcionalidade no MVC](#7-guia-para-a-equipe-como-adicionar-uma-nova-funcionalidade-no-mvc)

---

## 1. Entendendo o Padrão MVC em APIs REST

Em sistemas web tradicionais monolíticos, o MVC costuma renderizar páginas HTML diretamente no servidor. No entanto, em **APIs REST modernas** (onde o backend se comunica com um frontend como React/Vite via JSON), o padrão se adapta com muita elegância:

| Camada | Pasta | O que faz? | Exemplo |
| :--- | :--- | :--- | :--- |
| **Model** | `app/models/` | Representa os dados puros, entidades do domínio e estruturas de persistência. | `ResultadoSimulacao`, `PerfilInvestidor`, `FAQItem` |
| **View** | `app/views/` | Define o formato de entrada e saída dos dados em JSON (Schemas Pydantic). Valida tipos e monta a apresentação da resposta para o cliente. | `SimulacaoRequestView`, `SimulacaoResponseView` |
| **Controller** | `app/controllers/` | Orquestra a requisição: recebe a View validada, chama o Model ou Service de negócio e devolve os dados formatados na View de resposta. | `CalculadoraController.simular()` |
| **Routers** | `app/routers/` | Mapeia as URLs/endpoints HTTP (`@router.get`, `@router.post`) e direciona para o Controller responsável. | `/api/calculadora/simular` |
| **Services** | `app/services/` | *(Camada de Apoio)* Isola cálculos matemáticos complexos e regras de negócio para não poluir o Controller (*Controller Enxuto / Thin Controller*). | Fórmula de juros compostos, cálculo de pontuação |

---

## 2. Estrutura de Pastas e Arquivos

```text
backend/
├── app/
│   ├── config.py              # Configurações globais (CORS, prefixo de rotas, metadados)
│   ├── database.py            # Estrutura base de conexão com banco de dados
│   ├── main.py                # Ponto de entrada da aplicação FastAPI
│   │
│   ├── models/                # 📂 [MODEL] Entidades de domínio
│   │   ├── calculadora_model.py
│   │   ├── perfil_model.py
│   │   ├── faq_model.py
│   │   └── __init__.py
│   │
│   ├── views/                 # 📂 [VIEW] Schemas Pydantic de entrada e saída (JSON)
│   │   ├── calculadora_view.py
│   │   ├── perfil_view.py
│   │   ├── faq_view.py
│   │   └── __init__.py
│   │
│   ├── controllers/           # 📂 [CONTROLLER] Controladores do fluxo da aplicação
│   │   ├── calculadora_controller.py
│   │   ├── perfil_controller.py
│   │   ├── faq_controller.py
│   │   └── __init__.py
│   │
│   ├── routers/               # 📂 [ROUTERS] Endpoints HTTP organizados por módulo
│   │   ├── api.py             # Agregador central de rotas
│   │   ├── calculadora_router.py
│   │   ├── perfil_router.py
│   │   ├── faq_router.py
│   │   └── __init__.py
│   │
│   └── services/              # 📂 [SERVICES] Lógica de negócio e cálculos
│       ├── calculadora_service.py
│       ├── perfil_service.py
│       ├── faq_service.py
│       └── __init__.py
│
├── requirements.txt           # Dependências e bibliotecas do Python
├── test_api.py                # Bateria de testes automatizados dos endpoints
└── README.md                  # Este guia
```

---

## 3. Fluxo de uma Requisição (Passo a Passo)

Veja como uma requisição trafega pelas camadas do nosso backend:

```
[ Frontend / Postman ]
          │  (Requisição HTTP POST com JSON)
          ▼
┌──────────────────┐
│  app/routers/    │  1. Recebe a rota /api/calculadora/simular
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│  app/views/      │  2. Valida o JSON de entrada com Pydantic (SimulacaoRequestView)
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ app/controllers/ │  3. Controller converte View em Model e orquestra a chamada
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│  app/services/   │  4. Executa o cálculo de juros compostos e projeção mês a mês
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│  app/models/     │  5. Produz o modelo de domínio ResultadoSimulacao
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ app/controllers/ │  6. Mapeia o Model para a View de resposta (SimulacaoResponseView)
└─────────┬────────┘
          │  (Resposta HTTP 200 com JSON)
          ▼
[ Frontend / React ]
```

---

## 4. Módulos do Sistema

### 1. 🧮 Calculadora de Investimentos
- **Objetivo**: Simular a evolução patrimonial com aportes mensais e juros compostos.
- **Endpoint**: `POST /api/calculadora/simular`
- **Entrada**: Valor inicial, aporte mensal, taxa de juros anual (%), prazo em meses.
- **Saída**: Total investido, total em juros, montante final e lista da evolução mês a mês.

### 2. 🎯 Perfil de Investidor (Suitability)
- **Objetivo**: Identificar o perfil financeiro do usuário (Conservador, Moderado ou Arrojado) e sugerir a alocação de carteira ideal.
- **Endpoints**:
  - `GET /api/perfil/questionario` - Retorna as perguntas e alternativas.
  - `POST /api/perfil/avaliar` - Recebe as respostas, calcula a pontuação e entrega a sugestão de ativos (Renda Fixa, FIIs, Ações, etc.).

### 3. ❓ Dúvidas e FAQs
- **Objetivo**: Centralizar perguntas e respostas frequentes sobre finanças pessoais e investimentos.
- **Endpoints**:
  - `GET /api/faq` - Lista todas as dúvidas.
  - `GET /api/faq?busca=Selic` - Filtro por palavra-chave.
  - `GET /api/faq?categoria=Renda Fixa` - Filtro por categoria.

---

## 5. Guia: Como Rodar o Projeto Localmente

### Pré-requisitos
- **Python 3.10+** instalado no seu computador.

### Passo 1: Abrir o terminal na pasta `backend`
```bash
cd backend
```

### Passo 2: Criar e ativar o ambiente virtual (venv)

**No Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**No Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**No Windows (Prompt de Comando - CMD):**
```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

### Passo 3: Instalar as dependências
```bash
pip install -r requirements.txt
```

### Passo 4: Iniciar o servidor FastAPI
```bash
uvicorn app.main:app --reload --port 8000
```

Pronto! A API estará rodando em `http://127.0.0.1:8000`.

### 📖 Documentação Interativa no Navegador:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Permite testar todos os endpoints clicando em "Try it out").
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc).

---

## 6. Testes Automatizados

Para garantir que todas as camadas do MVC estão funcionando corretamente, criamos um script de testes automatizados com `pytest` e `TestClient`.

Para rodar os testes:
```bash
pytest test_api.py
```
ou
```bash
python test_api.py
```

---

## 7. Guia para a Equipe: Como Adicionar uma Nova Funcionalidade no MVC

Quando você for criar uma nova funcionalidade (exemplo: **Gastos / Orçamento Pessoal**), siga este passo a passo:

1. **Crie o Model em `app/models/gasto_model.py`**:
   Defina a classe de dados pura (dataclass ou entidade).
2. **Crie a View em `app/views/gasto_view.py`**:
   Crie os schemas Pydantic de entrada (`GastoCreateView`) e resposta (`GastoResponseView`).
3. **Crie o Service em `app/services/gasto_service.py`**:
   Escreva a lógica de cálculo ou operações necessárias.
4. **Crie o Controller em `app/controllers/gasto_controller.py`**:
   Crie a classe com métodos que recebem a View, acionam o Service e retornam a View de resposta.
5. **Crie a Rota em `app/routers/gasto_router.py`**:
   Defina o `@router.post` ou `@router.get` chamando o método do seu Controller.
6. **Registre no agregador em `app/routers/api.py`**:
   Adicione `api_router.include_router(gasto_router)`.

Assim, o código permanece 100% organizado, testável e fácil de entender por todos do grupo e pelos professores!
