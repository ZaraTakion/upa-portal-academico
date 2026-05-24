from rest_framework import serializers

from .models import AcademicFile, ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "user",
            "username",
            "full_name",
            "subject",
            "message",
            "created_at",
        ]
        read_only_fields = ["user"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class AcademicFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = AcademicFile
        fields = [
            "id",
            "user",
            "username",
            "full_name",
            "title",
            "file",
            "uploaded_at",
        ]
        read_only_fields = ["user"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username