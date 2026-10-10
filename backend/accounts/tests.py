from unittest.mock import patch

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode


@patch("accounts.views.PasswordResetRequestView.throttle_classes", [])
@patch("accounts.views.PasswordResetConfirmView.throttle_classes", [])
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="https://upa.example.test",
    DEFAULT_FROM_EMAIL="noreply@example.test",
)
class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student",
            email="student@example.test",
            password="Original-password-123!",
        )

    def test_request_sends_link_without_changing_password(self):
        response = self.client.post(
            reverse("reset-password-request"),
            {"email": self.user.email},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(self.user.check_password("Original-password-123!"))
        self.assertIn("https://upa.example.test/reset-password/", mail.outbox[0].body)

    def test_unknown_email_gets_same_generic_response_and_no_email(self):
        known = self.client.post(
            reverse("reset-password-request"),
            {"email": self.user.email},
            content_type="application/json",
        )
        mail.outbox.clear()
        unknown = self.client.post(
            reverse("reset-password-request"),
            {"email": "unknown@example.test"},
            content_type="application/json",
        )
        self.assertEqual(unknown.status_code, known.status_code)
        self.assertEqual(unknown.data, known.data)
        self.assertEqual(mail.outbox, [])

    def test_valid_token_changes_password_once(self):
        uidb64 = urlsafe_base64_encode(str(self.user.pk).encode())
        token = default_token_generator.make_token(self.user)
        confirm_url = reverse(
            "reset-password-confirm",
            kwargs={"uidb64": uidb64, "token": token},
        )
        response = self.client.post(
            confirm_url,
            {"new_password": "A-strong-new-password-942!"},
            content_type="application/json",
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.user.check_password("A-strong-new-password-942!"))

        replay = self.client.post(
            confirm_url,
            {"new_password": "Another-strong-password-956!"},
            content_type="application/json",
        )
        self.assertEqual(replay.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("A-strong-new-password-942!"))

    def test_invalid_token_does_not_change_password(self):
        uidb64 = urlsafe_base64_encode(str(self.user.pk).encode())
        response = self.client.post(
            reverse(
                "reset-password-confirm",
                kwargs={"uidb64": uidb64, "token": "invalid-token"},
            ),
            {"new_password": "A-strong-new-password-942!"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertTrue(self.user.check_password("Original-password-123!"))


class LoginThrottlingTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_login_endpoint_throttles_repeated_attempts(self):
        url = reverse("token_obtain_pair")
        credentials = {
            "username": "unknown-user",
            "password": "incorrect-password",
        }

        with patch(
            "accounts.throttles.LoginRateThrottle.get_rate",
            return_value="1/min",
        ):
            first_attempt = self.client.post(
                url, credentials, content_type="application/json"
            )
            second_attempt = self.client.post(
                url, credentials, content_type="application/json"
            )

        self.assertEqual(first_attempt.status_code, 401)
        self.assertEqual(second_attempt.status_code, 429)


class RefreshCookieTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="cookie-user",
            password="A-strong-password-123!",
        )

    @override_settings(JWT_REFRESH_COOKIE_SECURE=False)
    def test_refresh_token_is_http_only_rotated_and_not_returned(self):
        login = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "cookie-user", "password": "A-strong-password-123!"},
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.data)
        self.assertNotIn("refresh", login.data)
        cookie = login.cookies["upa_refresh"]
        self.assertTrue(cookie["httponly"])

        original_refresh = cookie.value
        refresh = self.client.post(
            reverse("token_refresh"),
            {},
            content_type="application/json",
        )
        self.assertEqual(refresh.status_code, 200)
        self.assertIn("access", refresh.data)
        self.assertNotIn("refresh", refresh.data)
        self.assertNotEqual(self.client.cookies["upa_refresh"].value, original_refresh)

    @override_settings(JWT_REFRESH_COOKIE_SECURE=False)
    def test_logout_revokes_refresh_cookie(self):
        self.client.post(
            reverse("token_obtain_pair"),
            {"username": "cookie-user", "password": "A-strong-password-123!"},
            content_type="application/json",
        )
        refresh = self.client.cookies["upa_refresh"].value
        logout = self.client.post(reverse("token_logout"), {}, content_type="application/json")
        self.assertEqual(logout.status_code, 205)
        self.assertEqual(logout.cookies["upa_refresh"].value, "")
        self.client.cookies["upa_refresh"] = refresh
        response = self.client.post(
            reverse("token_refresh"),
            {},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)


class TrustedProxySettingsTests(TestCase):
    """Protect HTTPS detection from untrusted X-Forwarded-Proto headers."""

    def test_proxy_header_requires_explicit_opt_in(self):
        import os
        import subprocess
        import sys
        from pathlib import Path

        for enabled, expected in (
            ("False", "None"),
            ("True", "('HTTP_X_FORWARDED_PROTO', 'https')"),
        ):
            with self.subTest(enabled=enabled):
                environment = os.environ.copy()
                environment["DJANGO_SETTINGS_MODULE"] = "core.settings"
                environment["TRUST_PROXY_SSL_HEADER"] = enabled
                result = subprocess.run(
                    [
                        sys.executable,
                        "-c",
                        "from django.conf import settings; print(settings.SECURE_PROXY_SSL_HEADER)",
                    ],
                    env=environment,
                    cwd=Path(__file__).resolve().parent.parent,
                    capture_output=True,
                    text=True,
                    check=False,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout.strip(), expected)
