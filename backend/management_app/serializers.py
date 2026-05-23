from rest_framework import serializers

from .models import AcademicFile, ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ContactMessage
        fields = ["id", "user", "username", "subject", "message", "created_at"]
        read_only_fields = ["user"]


class AcademicFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = AcademicFile
        fields = ["id", "user", "username", "title", "file", "uploaded_at"]
        read_only_fields = ["user"]