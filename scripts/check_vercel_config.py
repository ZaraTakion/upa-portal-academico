#!/usr/bin/env python3
"""Validate split hosting without requiring provider credentials."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
assert not (root / "vercel.json").exists(), "Root Vercel Services config must be removed"
assert not (root / "frontend/.env.production").exists(), "Never commit a fixed production API URL"
config = json.loads((root / "frontend/vercel.json").read_text(encoding="utf-8"))
assert config["rewrites"] == [
    {"source": "/api/:path*", "destination": "https://takion-campus-api.onrender.com/api/:path*"},
    {"source": "/(.*)", "destination": "/index.html"},
]
assert (root / "frontend/package.json").is_file()
assert (root / "backend/manage.py").is_file()
blueprint = (root / "render.yaml").read_text(encoding="utf-8")
for required in ("plan: free", "rootDir: backend", "runtime: python", "gunicorn core.wsgi:application", "DATABASE_URL", "CORS_ALLOWED_ORIGINS"):
    assert required in blueprint, required
vite = (root / "frontend/vite.config.js").read_text(encoding="utf-8")
assert "env.VITE_API_URL" in vite and "env.VERCEL" in vite
backend = (root / "backend/core/settings.py").read_text(encoding="utf-8")
assert "RENDER_EXTERNAL_HOSTNAME" in backend
assert "CSRF_TRUSTED_ORIGINS" in backend
print("Split deployment: Vercel Vite frontend + Render Django API: OK")
