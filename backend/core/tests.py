"""Regression tests for deployment trust boundaries."""

import os
import subprocess
import sys

from django.test import SimpleTestCase


class TrustedProxySettingsTests(SimpleTestCase):
    def test_proxy_header_requires_explicit_opt_in(self):
        for enabled, expected in (("False", "None"), ("True", "('HTTP_X_FORWARDED_PROTO', 'https')")):
            with self.subTest(enabled=enabled):
                environment = os.environ.copy()
                environment["DJANGO_SETTINGS_MODULE"] = "core.settings"
                environment["TRUST_PROXY_SSL_HEADER"] = enabled
                command = [
                    sys.executable,
                    "-c",
                    "from django.conf import settings; print(settings.SECURE_PROXY_SSL_HEADER)",
                ]
                result = subprocess.run(command, env=environment, capture_output=True, text=True, check=False)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout.strip(), expected)
