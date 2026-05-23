import json
from typing import Optional

import requests


BASE_URL = "http://127.0.0.1:8000"
USERNAME = "admin"
PASSWORD = "admin123"

results = []


def print_box(title: str):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def print_response(name: str, response: requests.Response):
    ok = 200 <= response.status_code < 300
    icon = "✅" if ok else "❌"

    results.append((name, response.status_code, ok))

    print(f"{icon} {name} — Status {response.status_code}")

    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except Exception:
        print(response.text[:800])

    print("-" * 70)


def request_api(
    name: str,
    method: str,
    endpoint: str,
    headers: Optional[dict] = None,
    json_data: Optional[dict] = None,
):
    try:
        response = requests.request(
            method=method,
            url=f"{BASE_URL}{endpoint}",
            headers=headers,
            json=json_data,
            timeout=10,
        )
        print_response(name, response)
        return response
    except requests.exceptions.ConnectionError:
        print(f"❌ {name} — servidor Django não está rodando.")
        results.append((name, "CONNECTION_ERROR", False))
        return None


def main():
    print_box("1. LOGIN JWT")

    login = request_api(
        "Login JWT",
        "POST",
        "/api/token/",
        json_data={
            "username": USERNAME,
            "password": PASSWORD,
        },
    )

    if not login or login.status_code != 200:
        print("Login falhou. Corrija antes de continuar.")
        return

    token = login.json()["access"]

    headers = {
        "Authorization": f"Bearer {token}",
    }

    print_box("2. ENDPOINTS PRINCIPAIS")

    tests = [
        ("Dashboard", "GET", "/api/dashboard/summary/"),
        ("Perfil do aluno", "GET", "/api/academic/students/"),
        ("Disciplinas", "GET", "/api/academic/subjects/"),
        ("Notas", "GET", "/api/academic/grades/"),
        ("Calendário", "GET", "/api/academic/calendar/"),
        ("Notificações", "GET", "/api/notifications/"),
        ("Contato", "GET", "/api/contact/"),
        ("Arquivos", "GET", "/api/files/"),
    ]

    for name, method, endpoint in tests:
        request_api(name, method, endpoint, headers=headers)

    print_box("3. BUSCAS E FILTROS")

    request_api(
        "Busca disciplinas",
        "GET",
        "/api/academic/subjects/?search=web",
        headers=headers,
    )

    request_api(
        "Filtro notas por disciplina",
        "GET",
        "/api/academic/grades/?subject=1",
        headers=headers,
    )

    request_api(
        "Notificações não lidas",
        "GET",
        "/api/notifications/?unread=true",
        headers=headers,
    )

    print_box("4. AÇÕES")

    request_api(
        "Marcar notificação como lida",
        "PATCH",
        "/api/notifications/1/mark_as_read/",
        headers=headers,
    )

    request_api(
        "Recuperação de senha",
        "POST",
        "/api/accounts/reset-password/",
        json_data={
            "username": USERNAME,
            "new_password": PASSWORD,
        },
    )

    print_box("RESUMO FINAL")

    success = [item for item in results if item[2]]
    failed = [item for item in results if not item[2]]

    print(f"✅ Sucesso: {len(success)}")
    print(f"❌ Falhas: {len(failed)}")

    if failed:
        print("\nRotas com problema:")
        for name, status, _ in failed:
            print(f"- {name}: {status}")


if __name__ == "__main__":
    main()