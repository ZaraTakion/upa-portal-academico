from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import AcademicCalendar, Grade, StudentProfile, Subject
from .serializers import (
    AcademicCalendarSerializer,
    GradeSerializer,
    StudentProfileSerializer,
    SubjectSerializer,
)


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return StudentProfile.objects.all()

        return StudentProfile.objects.filter(user=user)


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Subject.objects.all()
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = Grade.objects.all()
        else:
            queryset = Grade.objects.filter(student__user=user)

        subject = self.request.query_params.get("subject")

        if subject:
            queryset = queryset.filter(subject__id=subject)

        return queryset


class AcademicCalendarViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicCalendarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AcademicCalendar.objects.all().order_by("event_date")