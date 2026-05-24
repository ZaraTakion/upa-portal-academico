from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "username",
            "full_name",
            "title",
            "message",
            "is_read",
            "created_at",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username