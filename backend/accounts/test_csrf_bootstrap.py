from django.contrib.auth.models import User
from django.test import Client, TestCase, override_settings
from django.urls import reverse


@override_settings(CSRF_COOKIE_SECURE=False, JWT_REFRESH_COOKIE_SECURE=False)
class CsrfBootstrapTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        User.objects.create_user(username="csrf-student", password="Example-pass-42!")

    def test_refresh_requires_csrf_but_bootstrap_allows_safe_refresh(self):
        csrf = self.client.get(reverse("token_csrf"))
        login = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "csrf-student", "password": "Example-pass-42!"},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf.json()["csrf"],
        )
        self.assertEqual(login.status_code, 200)
        missing = self.client.post(reverse("token_refresh"), {}, content_type="application/json")
        self.assertEqual(missing.status_code, 403)
        csrf = self.client.get(reverse("token_csrf"))
        self.assertEqual(csrf.status_code, 200)
        self.assertIn("csrf", csrf.json())
        self.assertIn("csrftoken", csrf.cookies)
        refreshed = self.client.post(
            reverse("token_refresh"), {}, content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf.json()["csrf"],
        )
        self.assertEqual(refreshed.status_code, 200)
        self.assertIn("access", refreshed.json())

    def test_csrf_works_with_expired_bearer_token(self):
        response = self.client.get(
            reverse("token_csrf"), HTTP_AUTHORIZATION="Bearer invalid-token",
        )
        self.assertEqual(response.status_code, 200)


class DemoSeedSafetyTests(TestCase):
    @override_settings(DEBUG=False)
    def test_seed_command_is_rejected_outside_development(self):
        from django.core.management import call_command
        from django.core.management.base import CommandError

        with self.assertRaises(CommandError):
            call_command("seed_demo")
