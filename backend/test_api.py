import json
from typing import Optional

import requests


BASE_URL = "http://127.0.0.1:8000"
USERS = [
    ("Aluno", "rodrigo", "aluno123"),
    ("Professor", "leandro", "prof123"),
    ("Administrador", "admin", "admin123"),
]

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


def login(username, password):
    response = request_api(
        f"Login {username}",
        "POST",
        "/api/token/",
        json_data={
            "username": username,
            "password": password,
        },
    )

    if not response or response.status_code != 200:
        return None

    return response.json().get("access")


def run_user_tests(role, username, password):
    print_box(f"TESTES — {role.upper()}")

    token = login(username, password)

    if not token:
        print(f"Login falhou para {role}.")
        return

    headers = {
        "Authorization": f"Bearer {token}",
    }

    tests = [
        ("Usuário logado", "GET", "/api/accounts/me/"),
        ("Resumo do dashboard", "GET", "/api/dashboard/summary/"),
        ("Perfil aluno", "GET", "/api/academic/students/"),
        ("Perfil professor", "GET", "/api/academic/teachers/"),
        ("Disciplinas", "GET", "/api/academic/subjects/"),
        ("Turmas", "GET", "/api/academic/class-groups/"),
        ("Matrículas em turmas", "GET", "/api/academic/class-enrollments/"),
        ("Notas", "GET", "/api/academic/grades/"),
        ("Calendário", "GET", "/api/academic/calendar/"),
        ("Notificações", "GET", "/api/notifications/"),
        ("Contato", "GET", "/api/contact/"),
        ("Arquivos", "GET", "/api/files/"),
        ("Busca disciplinas", "GET", "/api/academic/subjects/?search=Front"),
        ("Notificações não lidas", "GET", "/api/notifications/?unread=true"),
    ]

    for name, method, endpoint in tests:
        request_api(f"{role} — {name}", method, endpoint, headers=headers)


def print_summary():
    print_box("RESUMO FINAL")

    success = [item for item in results if item[2]]
    failed = [item for item in results if not item[2]]

    print(f"✅ Sucesso: {len(success)}")
    print(f"❌ Falhas: {len(failed)}")

    if failed:
        print("\nRotas com problema:")
        for name, status, _ in failed:
            print(f"- {name}: {status}")


def main():
    for role, username, password in USERS:
        run_user_tests(role, username, password)

    print_summary()


if __name__ == "__main__":
    main()