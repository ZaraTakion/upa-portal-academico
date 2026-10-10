#!/usr/bin/env bash
set -euo pipefail

# Legacy manual build script. Vercel handles Django dependencies and collectstatic.
# Never migrate a shared production database implicitly during a build.
python manage.py check --deploy
python manage.py collectstatic --no-input
