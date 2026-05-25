from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from .models import AcademicFile, ContactMessage, FinancialInvoice
from .serializers import (
    AcademicFileSerializer,
    ContactMessageSerializer,
    FinancialInvoiceSerializer,
)


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return ContactMessage.objects.all().order_by("-created_at")

        return ContactMessage.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AcademicFileViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.groups.filter(name="Professor").exists():
            return AcademicFile.objects.all().order_by("-uploaded_at")

        return AcademicFile.objects.filter(user=user).order_by("-uploaded_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FinancialInvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialInvoiceSerializer
    permission_classes = [IsAuthenticated]

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