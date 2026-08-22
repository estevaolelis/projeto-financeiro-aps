"""
Script de teste automatizado para validar a arquitetura MVC e endpoints da API.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Iniciando testes da API MVC...")

    # 1. Teste Root & Healthcheck
    res_root = client.get("/")
    assert res_root.status_code == 200, f"Erro root: {res_root.text}"
    print("✓ [GET /] Raiz OK:", res_root.json())

    res_msg = client.get("/api/mensagem")
    assert res_msg.status_code == 200, f"Erro mensagem: {res_msg.text}"
    print("✓ [GET /api/mensagem] OK:", res_msg.json())

    # 2. Teste Calculadora Controller / View / Service
    payload_calc = {
        "valor_inicial": 1000.0,
        "aporte_mensal": 200.0,
        "taxa_juros_anual": 12.0,
        "prazo_meses": 12
    }
    res_calc = client.post("/api/calculadora/simular", json=payload_calc)
    assert res_calc.status_code == 200, f"Erro calculadora: {res_calc.text}"
    data_calc = res_calc.json()
    assert data_calc["montante_final"] > data_calc["total_investido"]
    assert len(data_calc["evolucao"]) == 12
    print("✓ [POST /api/calculadora/simular] Calculadora MVC OK: Montante =", data_calc["montante_final"])

    # 3. Teste Perfil de Investidor Controller / View / Service
    res_perfil_quest = client.get("/api/perfil/questionario")
    assert res_perfil_quest.status_code == 200, f"Erro questionario: {res_perfil_quest.text}"
    quest_data = res_perfil_quest.json()
    assert len(quest_data["perguntas"]) > 0
    print("✓ [GET /api/perfil/questionario] Questionário OK: Total de perguntas =", len(quest_data["perguntas"]))

    payload_perfil = {
        "respostas": [
            {"pergunta_id": 1, "opcao_id": "c"},
            {"pergunta_id": 2, "opcao_id": "c"},
            {"pergunta_id": 3, "opcao_id": "c"},
            {"pergunta_id": 4, "opcao_id": "b"},
            {"pergunta_id": 5, "opcao_id": "c"},
        ]
    }
    res_perfil_aval = client.post("/api/perfil/avaliar", json=payload_perfil)
    assert res_perfil_aval.status_code == 200, f"Erro avaliacao: {res_perfil_aval.text}"
    perfil_data = res_perfil_aval.json()
    assert "perfil" in perfil_data
    print("✓ [POST /api/perfil/avaliar] Perfil Avaliado OK:", perfil_data["perfil"], f"(Pontos: {perfil_data['pontuacao_total']})")

    # 4. Teste FAQ Controller / View / Service
    res_faq = client.get("/api/faq")
    assert res_faq.status_code == 200, f"Erro FAQ: {res_faq.text}"
    faq_data = res_faq.json()
    assert faq_data["total"] > 0
    print("✓ [GET /api/faq] FAQ Listagem OK: Total de itens =", faq_data["total"])

    # Teste FAQ com busca
    res_faq_busca = client.get("/api/faq?busca=Selic")
    assert res_faq_busca.status_code == 200, f"Erro busca FAQ: {res_faq_busca.text}"
    faq_busca_data = res_faq_busca.json()
    assert faq_busca_data["total"] >= 1
    print("✓ [GET /api/faq?busca=Selic] FAQ Busca filtrada OK: Encontrados =", faq_busca_data["total"])

    print("\n TODOS OS TESTES PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    test_endpoints()
