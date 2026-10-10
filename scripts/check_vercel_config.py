#!/usr/bin/env python3
"""Validate Vercel routing in CI without deployment credentials."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
config = json.loads((root / "vercel.json").read_text(encoding="utf-8"))
services = config["services"]
assert set(services) == {"backend", "frontend"}
assert services["backend"]["root"] == "backend"
assert services["frontend"]["root"] == "frontend"
assert services["backend"]["framework"] == "django"
assert services["frontend"]["framework"] == "vite"
# This application has no server-to-server service calls. React executes API
# requests in the browser through same-origin public /api/ routes.
# A binding (runtime-only Vercel injected URL) would not be available to Vite
# during the build or to browser JavaScript.
assert not services["frontend"].get("bindings"), "Frontend browser API calls must not use service bindings"
assert not services["backend"].get("bindings"), "Do not add unused backend-to-frontend bindings"
assert (root / "backend/manage.py").is_file()
assert (root / "frontend/package.json").is_file()
routes = config["rewrites"]
assert routes[-1] == {"source": "/(.*)", "destination": {"service": "frontend", "path": "/index.html"}}
cases = {
    "/api/token/": "backend",
    "/api/accounts/me/": "backend",
    "/api/token/refresh/": "backend",
    "/admin/": "backend",
    "/admin/login/": "backend",
    "/static/admin/css/base.css": "backend",
    "/health/": "backend",
    "/assets/index.js": "frontend",
    "/favicon.svg": "frontend",
    "/manifest.json": "frontend",
    "/dashboard": "frontend",
    "/teacher/classes": "frontend",
    "/admin-panel": "frontend",
    "/reset-password/opaque": "frontend",
}
for path, expected in cases.items():
    match = next((route["destination"] for route in routes if re.fullmatch(route["source"], path)), None)
    assert match and match["service"] == expected, (path, match, expected)
env = (root / "frontend/.env.production").read_text(encoding="utf-8")
assert "VITE_API_URL=/api" in env
assert "VITE_DJANGO_ADMIN_URL=/admin/" in env
assert "localhost" not in env
frontend_api = (root / "frontend/src/api/axios.js").read_text(encoding="utf-8")
frontend_auth = (root / "frontend/src/utils/auth.js").read_text(encoding="utf-8")
assert 'import.meta.env.PROD ? "/api"' in frontend_api
assert 'import.meta.env.PROD ? "/api"' in frontend_auth
print("Vercel Services routing, same-origin browser API and binding contract: OK")
