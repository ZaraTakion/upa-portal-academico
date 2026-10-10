#!/usr/bin/env bash
set -euo pipefail

# Render build runs from backend; dependencies are installed by the Blueprint.
# Never migrate a shared production database implicitly during a build.
python manage.py check --deploy --fail-level WARNING
python manage.py collectstatic --no-input
