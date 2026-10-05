import os

from django.conf import settings
from rest_framework import serializers
from rest_framework.reverse import reverse

from .models import AcademicFile, ContactMessage, FinancialInvoice


ALLOWED_UPLOADS = {
    ".pdf": ("application/pdf", b"%PDF-"),
    ".png": ("image/png", b"\x89PNG\r\n\x1a\n"),
    ".jpg": ("image/jpeg", b"\xff\xd8\xff"),
    ".jpeg": ("image/jpeg", b"\xff\xd8\xff"),
    ".txt": ("text/plain", None),
    ".docx": (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        b"PK\x03\x04",
    ),
    ".xlsx": (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        b"PK\x03\x04",
    ),
    ".pptx": (
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        b"PK\x03\x04",
    ),
}


class ContactMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    contact_type_display = serializers.CharField(source="get_contact_type_display", read_only=True)
    return_channel_display = serializers.CharField(source="get_return_channel_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "protocol",
            "status",
            "status_display",
            "response_at",
            "updated_at",
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
        read_only_fields = [
            "user", "protocol", "status", "status_display", "response",
            "response_at", "updated_at",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_staff:
            fields["response"].read_only = False
            fields["status"].read_only = False
        return fields


class AcademicFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class_group_name = serializers.CharField(source="class_group.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    file_type_display = serializers.CharField(source="get_file_type_display", read_only=True)
    assignment = serializers.PrimaryKeyRelatedField(
        queryset=AcademicFile.objects.filter(file_type="assignment"),
        required=False,
        allow_null=True,
    )
    due_at = serializers.DateTimeField(required=False, allow_null=True)
    assignment_due_at = serializers.SerializerMethodField()
    submission_status = serializers.SerializerMethodField()
    reviewed_at = serializers.DateTimeField(read_only=True)
    feedback = serializers.CharField(read_only=True, allow_blank=True)
    file = serializers.FileField(write_only=True, allow_empty_file=False)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = AcademicFile
        fields = [
            "id",
            "user",
            "username",
            "class_group",
            "class_group_name",
            "subject",
            "subject_name",
            "title",
            "file_type",
            "file_type_display",
            "assignment",
            "due_at",
            "assignment_due_at",
            "submission_status",
            "feedback",
            "reviewed_at",
            "file",
            "download_url",
            "uploaded_at",
        ]
        read_only_fields = [
            "user",
            "subject",
            "class_group_name",
            "subject_name",
            "file_type_display",
            "due_at",
            "submission_status",
            "feedback",
            "reviewed_at",
            "download_url",
            "uploaded_at",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return fields
        if not user.is_staff and not user.groups.filter(name="Professor").exists():
            fields["file_type"].read_only = True
            fields["due_at"].read_only = True
            fields["assignment"].required = False
            fields["feedback"].read_only = True
        else:
            fields["feedback"].read_only = True
        return fields

    def get_download_url(self, obj):
        request = self.context.get("request")
        return reverse("files-download", args=[obj.pk], request=request)

    def get_assignment_due_at(self, obj):
        return obj.assignment.due_at if obj.assignment_id else None

    def get_submission_status(self, obj):
        if obj.file_type != "submission":
            return None
        if obj.reviewed_at:
            return "reviewed"
        if obj.assignment_id and obj.assignment.due_at and obj.uploaded_at > obj.assignment.due_at:
            return "late"
        return "submitted"

    def validate(self, attrs):
        class_group = attrs.get("class_group", getattr(self.instance, "class_group", None))
        assignment = attrs.get("assignment", getattr(self.instance, "assignment", None))
        file_type = attrs.get("file_type", getattr(self.instance, "file_type", "submission"))
        due_at = attrs.get("due_at", getattr(self.instance, "due_at", None))
        if assignment:
            if assignment.file_type != "assignment":
                raise serializers.ValidationError({"assignment": "Selecione uma atividade válida."})
            if class_group and class_group.pk != assignment.class_group_id:
                raise serializers.ValidationError({"class_group": "A atividade pertence a outra turma."})
            if file_type not in {"submission", "assignment"}:
                raise serializers.ValidationError({"assignment": "Apenas entregas podem ser vinculadas a uma atividade."})
        if file_type == "assignment" and not due_at:
            raise serializers.ValidationError({"due_at": "Informe o prazo para entrega."})
        if class_group:
            attrs["subject"] = class_group.subject
        return attrs

    def validate_file(self, uploaded):
        if uploaded.size > settings.ACADEMIC_FILE_MAX_SIZE:
            limit_mb = settings.ACADEMIC_FILE_MAX_SIZE // (1024 * 1024)
            raise serializers.ValidationError(
                f"O arquivo excede o limite de {limit_mb} MB."
            )

        extension = os.path.splitext(uploaded.name)[1].lower()
        expected = ALLOWED_UPLOADS.get(extension)
        if not expected:
            raise serializers.ValidationError(
                "Formato não permitido. Envie PDF, PNG, JPG, TXT, DOCX, XLSX ou PPTX."
            )

        expected_mime, signature = expected
        if uploaded.content_type != expected_mime:
            raise serializers.ValidationError(
                "O tipo de conteúdo não corresponde à extensão do arquivo."
            )

        sample = uploaded.read(8192)
        uploaded.seek(0)
        if signature and not sample.startswith(signature):
            raise serializers.ValidationError(
                "O conteúdo do arquivo não corresponde ao formato declarado."
            )
        if extension == ".txt" and b"\x00" in sample:
            raise serializers.ValidationError("O arquivo TXT contém dados binários.")
        return uploaded


class FinancialInvoiceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True, allow_null=True)

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
