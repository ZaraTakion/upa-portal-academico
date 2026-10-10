import os
from pathlib import Path

from django.db.models import Q
from django.http import FileResponse, Http404
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from academic.models import ClassEnrollment
from core.permissions import (
    CanManageAcademicFile,
    IsStaffOrCreateOnly,
    IsStaffOrReadOnly,
)
from core.viewsets import PortalModelViewSet

from .models import AcademicFile, ContactMessage, FinancialInvoice
from .serializers import (
    ALLOWED_UPLOADS,
    AcademicFileSerializer,
    ContactMessageSerializer,
    FinancialInvoiceSerializer,
)


class ContactMessageViewSet(PortalModelViewSet):
    queryset = ContactMessage.objects.none()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsStaffOrCreateOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            return ContactMessage.objects.select_related("user").all().order_by("-created_at")
        return ContactMessage.objects.filter(user=user).select_related("user").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        update_fields = {}
        if "response" in serializer.validated_data:
            update_fields["response_at"] = timezone.now()
            update_fields["status"] = serializer.validated_data.get("status", "answered")
        serializer.save(**update_fields)


class AcademicFileViewSet(PortalModelViewSet):
    queryset = AcademicFile.objects.none()
    serializer_class = AcademicFileSerializer
    permission_classes = [CanManageAcademicFile]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            queryset = AcademicFile.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = AcademicFile.objects.filter(
                class_group__teacher__user=user,
                file_type__in=("material", "assignment", "submission"),
            )
        else:
            queryset = AcademicFile.objects.filter(
                Q(user=user, file_type__in=("submission", "document"))
                | Q(
                    file_type__in=("material", "assignment"),
                    class_group__classenrollment__student__user=user,
                )
            ).distinct()
        return queryset.select_related(
            "user", "subject", "class_group", "class_group__teacher__user", "assignment"
        ).order_by("-uploaded_at")

    def perform_create(self, serializer):
        user = self.request.user
        class_group = serializer.validated_data.get("class_group")
        assignment = serializer.validated_data.get("assignment")

        if user.is_staff:
            file_type = serializer.validated_data.get("file_type", "submission")
            if file_type in {"material", "assignment", "submission"} and class_group is None:
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
            requested_type = serializer.validated_data.get("file_type", "material")
            file_type = requested_type if requested_type in {"material", "assignment"} else "material"
            serializer.save(
                user=user,
                class_group=class_group,
                subject=class_group.subject,
                file_type=file_type,
            )
            return

        if assignment:
            class_group = assignment.class_group
        if class_group is None or not ClassEnrollment.objects.filter(
            class_group=class_group,
            student__user=user,
        ).exists():
            raise PermissionDenied(
                "Selecione uma turma em que você esteja matriculado."
            )

        if assignment and assignment.due_at and timezone.now() > assignment.due_at:
            raise ValidationError({"assignment": "O prazo desta atividade já terminou."})
        serializer.save(
            user=user,
            class_group=class_group,
            subject=class_group.subject,
            assignment=assignment,
            file_type="submission",
        )

    def perform_update(self, serializer):
        user = self.request.user
        if not user.is_staff and "feedback" in serializer.validated_data:
            serializer.save(reviewed_at=timezone.now())
        else:
            serializer.save()

    @extend_schema(responses={(200, "application/octet-stream"): OpenApiTypes.BINARY})
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
        response = FileResponse(
            stored_file,
            as_attachment=True,
            filename=filename,
            content_type=mime_type,
        )
        response["Cache-Control"] = "private, no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response


class FinancialInvoiceViewSet(PortalModelViewSet):
    queryset = FinancialInvoice.objects.none()
    serializer_class = FinancialInvoiceSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            queryset = FinancialInvoice.objects.all()
        else:
            queryset = FinancialInvoice.objects.filter(user=user)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.select_related("user").order_by("due_date", "pk")
