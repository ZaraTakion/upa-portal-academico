"""Invalid JSON types must never crash the public password-reset route."""

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.test import TestCase
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode


class PasswordResetInputTests(TestCase):
    def test_non_string_passwords_are_rejected_without_modifying_account(self):
        user = get_user_model().objects.create_user(
            username="reset-invalid-type-user",
            email="reset-invalid-type@example.test",
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])
        previous_hash = user.password
        uid = urlsafe_base64_encode(str(user.pk).encode())
        token = default_token_generator.make_token(user)
        url = reverse("reset-password-confirm", kwargs={"uidb64": uid, "token": token})

        for invalid in (None, 123, True, [], {}, ["nested"]):
            with self.subTest(value=invalid):
                result = self.client.post(
                    url, data={"new_password": invalid}, content_type="application/json"
                )
                self.assertEqual(result.status_code, 400)
                user.refresh_from_db()
                self.assertEqual(user.password, previous_hash)
