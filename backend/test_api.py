import json
import requests


BASE_URL = "http://127.0.0.1:8000"

USERS = [
    ("Aluno", "rodrigo", "aluno123"),
    ("Professor", "leandro", "prof123"),
    ("Admin", "admin", "admin123"),
]


def print_response(name, response):
    ok = 200 <= response.status_code < 300
    icon = "✅" if ok else "❌"
    print(f"{icon} {name} — {response.status_code}")

    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False)[:1200])
    except Exception:
        print(response.text[:800])

    print("-" * 70)


def login(username, password):
    response = requests.post(
        f"{BASE_URL}/api/token/",
        json={"username": username, "password": password},
        timeout=10,
    )
    print_response(f"Login {username}", response)

    if response.status_code != 200:
        return None

    return response.json()["access"]


def run_tests(role, username, password):
    print("\n" + "=" * 70)
    print(f"TESTANDO {role.upper()}")
    print("=" * 70)

    token = login(username, password)

    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}

    endpoints = [
        "/api/accounts/me/",
        "/api/dashboard/summary/",
        "/api/academic/students/",
        "/api/academic/teachers/",
        "/api/academic/subjects/",
        "/api/academic/subjects/?period=4",
        "/api/academic/grades/",
        "/api/academic/grades/?status=approved",
        "/api/academic/calendar/",
        "/api/academic/calendar/?event_type=holiday",
        "/api/academic/weekly-schedule/",
        "/api/notifications/",
        "/api/notifications/?active_only=true",
        "/api/contact/",
        "/api/files/",
        "/api/financial/",
    ]

    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
        print_response(f"{role} GET {endpoint}", response)


def main():
    for role, username, password in USERS:
        run_tests(role, username, password)


if __name__ == "__main__":
    main()