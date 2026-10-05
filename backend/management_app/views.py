import os
from pathlib import Path

from django.db.models import Q
from django.utils import timezone
from django.http import FileResponse, Http404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from academic.models import ClassEnrollment
from core.permissions import (
    CanManageAcademicFile,
    IsStaffOrCreateOnly,
    IsStaffOrReadOnly,
)
from .models import AcademicFile, ContactMessage, FinancialInvoice
from .serializers import (
    ALLOWED_UPLOADS,
    AcademicFileSerializer,
    ContactMessageSerializer,
    FinancialInvoiceSerializer,
)


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = [IsStaffOrCreateOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ContactMessage.objects.all().order_by("-created_at")
        return ContactMessage.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        update_fields = {}
        if "response" in serializer.validated_data:
            update_fields["response_at"] = timezone.now()
            update_fields["status"] = serializer.validated_data.get("status", "answered")
        serializer.save(**update_fields)


class AcademicFileViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicFileSerializer
    permission_classes = [CanManageAcademicFile]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = AcademicFile.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = AcademicFile.objects.filter(
                class_group__teacher__user=user,
                file_type__in=("material", "submission"),
            )
        else:
            queryset = AcademicFile.objects.filter(
                Q(user=user, file_type__in=("submission", "document"))
                | Q(
                    file_type="material",
                    class_group__classenrollment__student__user=user,
                )
            ).distinct()
        return queryset.select_related(
            "user", "subject", "class_group", "class_group__teacher__user"
        ).order_by("-uploaded_at")

    def perform_create(self, serializer):
        user = self.request.user
        class_group = serializer.validated_data.get("class_group")

        if user.is_staff:
            file_type = serializer.validated_data.get("file_type", "submission")
            if file_type in {"material", "submission"} and class_group is None:
                raise ValidationError(
                    {"class_group": "Selecione a turma para este tipo de arquivo."}
                )
            serializer.save(
                user=user,
                subject=class_group.subject if class_group else None,
            )
            return

        if user.groups.filter(name="Professor").exists():
            if class_group is None or class_group.teacher.user_id != user.id:
                raise PermissionDenied(
                    "Você só pode enviar materiais para uma turma sua."
                )
            serializer.save(
                user=user,
                class_group=class_group,
                subject=class_group.subject,
                file_type="material",
            )
            return

        if class_group is None or not ClassEnrollment.objects.filter(
            class_group=class_group,
            student__user=user,
        ).exists():
            raise PermissionDenied(
                "Selecione uma turma em que você esteja matriculado."
            )

        serializer.save(
            user=user,
            class_group=class_group,
            subject=class_group.subject,
            file_type="submission",
        )

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        academic_file = self.get_object()
        try:
            stored_file = academic_file.file.open("rb")
        except (FileNotFoundError, OSError, ValueError):
            raise Http404("Arquivo não encontrado.")

        extension = os.path.splitext(academic_file.file.name)[1].lower()
        mime_type = ALLOWED_UPLOADS.get(extension, ("application/octet-stream", None))[0]
        filename = Path(academic_file.file.name).name
        return FileResponse(
            stored_file,
            as_attachment=True,
            filename=filename,
            content_type=mime_type,
        )


class FinancialInvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialInvoiceSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = FinancialInvoice.objects.all()
        else:
            queryset = FinancialInvoice.objects.filter(user=user)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.order_by("due_date")
