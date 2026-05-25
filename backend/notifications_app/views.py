from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
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
            today = timezone.localdate()
            queryset = queryset.filter(expires_at__gte=today)

        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        return queryset.order_by("-created_at")

    @action(detail=True, methods=["patch"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()

        return Response(
            {"detail": "Notificação marcada como lida."},
            status=status.HTTP_200_OK,
        )