from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator


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

    def test_request_sends_single_use_reset_link_without_changing_password(self):
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
        uid = force_str(self.user.pk)
        from django.utils.http import urlsafe_base64_encode
        uidb64 = urlsafe_base64_encode(uid.encode())
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
