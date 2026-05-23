from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from .models import AcademicFile, ContactMessage
from .serializers import AcademicFileSerializer, ContactMessageSerializer


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

        if user.is_staff:
            return AcademicFile.objects.all().order_by("-uploaded_at")

        return AcademicFile.objects.filter(user=user).order_by("-uploaded_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)