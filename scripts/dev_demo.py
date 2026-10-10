#!/usr/bin/env python3
"""Start an isolated, localhost-only Takion Campus demo with one command."""
import argparse
import os
import secrets
import subprocess
import sys
import time
import urllib.request
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
VENV = BACKEND / ".venv"
SECRET = BACKEND / ".demo-secret"

def python_in_venv():
    return VENV / ("Scripts/python.exe" if os.name == "nt" else "bin/python")

def run(command, cwd, env=None):
    subprocess.run([str(item) for item in command], cwd=cwd, env=env, check=True)

def local_secret():
    if not SECRET.exists():
        fd = os.open(SECRET, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(secrets.token_urlsafe(48))
    return SECRET.read_text(encoding="utf-8").strip()

def local_environment():
    if os.environ.get("DATABASE_URL", "").strip():
        raise RuntimeError("Demonstração recusada: DATABASE_URL deve estar vazia.")
    if os.environ.get("DEBUG", "True").lower() in {"false", "0", "off", "no"}:
        raise RuntimeError("Demonstração recusada: DEBUG=False.")
    env = os.environ.copy()
    env.update({
        "DEBUG": "True",
        "SECRET_KEY": local_secret(),
        "DATABASE_URL": "",
        "SQLITE_DB_PATH": str(BACKEND / ".demo.sqlite3"),
        "ALLOW_SQLITE_DATABASE": "True",
        "ALLOW_LOCAL_MEDIA_STORAGE": "True",
        "ALLOWED_HOSTS": "127.0.0.1,localhost",
        "CORS_ALLOWED_ORIGINS": "http://127.0.0.1:5173",
        "CSRF_TRUSTED_ORIGINS": "http://127.0.0.1:5173",
        "FRONTEND_URL": "http://127.0.0.1:5173",
        "EMAIL_BACKEND": "django.core.mail.backends.console.EmailBackend",
        "VITE_API_URL": "http://127.0.0.1:8000/api",
        "VITE_DJANGO_ADMIN_URL": "http://127.0.0.1:8000/admin/",
        "TRUST_PROXY_SSL_HEADER": "False",
        "PYTHONUNBUFFERED": "1",
    })
    return env

def wait_for(url, process, seconds=35):
    for _ in range(seconds * 4):
        if process.poll() is not None:
            raise RuntimeError(f"Servidor terminou inesperadamente: {process.returncode}")
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return
        except Exception:
            pass
        time.sleep(0.25)
    raise RuntimeError(f"Servidor não iniciou: {url}")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--setup-only", action="store_true", help="Preparar demonstração, sem iniciar servidores")
    parser.add_argument("--no-install", action="store_true", help="Não reinstalar dependências já preparadas")
    args = parser.parse_args()
    if sys.version_info < (3, 13):
        parser.error("Python 3.13+ é necessário.")
    env = local_environment()
    if not VENV.is_dir():
        venv.EnvBuilder(with_pip=True).create(VENV)
    py = python_in_venv()
    if not args.no_install:
        run([py, "-m", "pip", "install", "-r", BACKEND / "requirements.txt"], BACKEND, env)
        run(["npm", "ci"], FRONTEND, env)
    run([py, "manage.py", "migrate", "--noinput"], BACKEND, env)
    run([py, "manage.py", "seed_demo"], BACKEND, env)
    run([py, "manage.py", "check"], BACKEND, env)
    print("Demonstração local pronta: estudante, professor e administrador.", flush=True)
    if args.setup_only:
        return
    processes = []
    try:
        backend = subprocess.Popen([str(py), "manage.py", "runserver", "--noreload", "127.0.0.1:8000"], cwd=BACKEND, env=env)
        processes.append(backend)
        wait_for("http://127.0.0.1:8000/health/", backend)
        frontend = subprocess.Popen(["npm", "run", "dev", "--", "--host", "127.0.0.1", "--strictPort"], cwd=FRONTEND, env=env)
        processes.append(frontend)
        wait_for("http://127.0.0.1:5173/", frontend)
        print("Acesse http://127.0.0.1:5173/ e use as credenciais exibidas pelo seed_demo.", flush=True)
        print("Use Ctrl+C para encerrar os dois serviços.", flush=True)
        while all(process.poll() is None for process in processes):
            time.sleep(0.5)
        raise RuntimeError("Um dos serviços foi encerrado inesperadamente.")
    except KeyboardInterrupt:
        print("\nEncerrando demonstração...", flush=True)
    finally:
        for process in reversed(processes):
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=6)
                except subprocess.TimeoutExpired:
                    process.kill()

if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, OSError) as error:
        print(f"Falha ao preparar o ambiente local: {error}", file=sys.stderr)
        sys.exit(1)
