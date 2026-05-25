from rest_framework import serializers
from .models import AcademicFile, ContactMessage, FinancialInvoice


class ContactMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    contact_type_display = serializers.CharField(source="get_contact_type_display", read_only=True)
    return_channel_display = serializers.CharField(source="get_return_channel_display", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "user",
            "username",
            "destination",
            "contact_type",
            "contact_type_display",
            "return_channel",
            "return_channel_display",
            "subject",
            "message",
            "response",
            "created_at",
        ]
        read_only_fields = ["user", "response"]


class AcademicFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    file_type_display = serializers.CharField(source="get_file_type_display", read_only=True)

    class Meta:
        model = AcademicFile
        fields = [
            "id",
            "user",
            "username",
            "subject",
            "subject_name",
            "title",
            "file_type",
            "file_type_display",
            "file",
            "uploaded_at",
        ]
        read_only_fields = ["user"]


class FinancialInvoiceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True)

    class Meta:
        model = FinancialInvoice
        fields = [
            "id",
            "user",
            "username",
            "description",
            "amount",
            "due_date",
            "status",
            "status_display",
            "payment_method",
            "payment_method_display",
        ]
        read_only_fields = ["user"]