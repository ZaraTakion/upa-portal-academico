from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsNotificationOwnerOrStaff
from core.viewsets import PortalModelViewSet

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(PortalModelViewSet):
    queryset = Notification.objects.none()
    serializer_class = NotificationSerializer
    permission_classes = [IsNotificationOwnerOrStaff]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            queryset = Notification.objects.all()
        else:
            queryset = Notification.objects.filter(user=user)

        unread = self.request.query_params.get("unread")
        active_only = self.request.query_params.get("active_only")
        notification_type = self.request.query_params.get("type")
        if unread == "true":
            queryset = queryset.filter(is_read=False)
        if active_only == "true":
            queryset = queryset.filter(
                Q(expires_at__isnull=True)
                | Q(expires_at__gte=timezone.localdate())
            )
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        return queryset.select_related("user").order_by("-created_at", "-pk")

    @action(detail=True, methods=["patch"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(
            {"detail": "Notificação marcada como lida."},
            status=status.HTTP_200_OK,
        )
