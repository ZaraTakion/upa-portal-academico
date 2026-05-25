from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    type_display = serializers.CharField(source="get_notification_type_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "username",
            "title",
            "message",
            "notification_type",
            "type_display",
            "is_read",
            "expires_at",
            "created_at",
        ]