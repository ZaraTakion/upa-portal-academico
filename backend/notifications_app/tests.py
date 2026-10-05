from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Notification


class NotificationAccessTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner")
        self.other_user = User.objects.create_user(username="other")
        self.client = APIClient()

    def test_users_only_see_their_notifications(self):
        own = Notification.objects.create(
            user=self.owner,
            title="Minha notificação",
            message="Mensagem",
        )
        Notification.objects.create(
            user=self.other_user,
            title="Privada",
            message="Mensagem",
        )

        self.client.force_authenticate(self.owner)
        response = self.client.get(reverse("notifications-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [own.pk])

    def test_active_only_includes_notifications_without_expiry(self):
        today = timezone.localdate()
        Notification.objects.create(
            user=self.owner,
            title="Sem expiração",
            message="Válida sem data final.",
            expires_at=None,
        )
        Notification.objects.create(
            user=self.owner,
            title="Vigente",
            message="Ainda válida.",
            expires_at=today + timedelta(days=1),
        )
        Notification.objects.create(
            user=self.owner,
            title="Expirada",
            message="Não deve aparecer.",
            expires_at=today - timedelta(days=1),
        )

        self.client.force_authenticate(self.owner)
        response = self.client.get(
            reverse("notifications-list"), {"active_only": "true"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {item["title"] for item in response.data},
            {"Sem expiração", "Vigente"},
        )

    def test_users_cannot_mark_another_users_notification_as_read(self):
        notification = Notification.objects.create(
            user=self.owner,
            title="Privada",
            message="Mensagem",
        )
        self.client.force_authenticate(self.other_user)

        response = self.client.patch(
            reverse("notifications-mark-as-read", args=[notification.pk]),
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
