from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)
from .serializers import (
    AcademicCalendarSerializer,
    ClassEnrollmentSerializer,
    ClassGroupSerializer,
    GradeSerializer,
    StudentProfileSerializer,
    SubjectSerializer,
    TeacherProfileSerializer,
    WeeklyScheduleSerializer,
)


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.groups.filter(name="Professor").exists():
            return StudentProfile.objects.all()

        return StudentProfile.objects.filter(user=user)


class TeacherProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return TeacherProfile.objects.all()

        return TeacherProfile.objects.filter(user=user)


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Subject.objects.all()

        search = self.request.query_params.get("search")
        period = self.request.query_params.get("period")
        status_param = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(name__icontains=search)

        if period:
            queryset = queryset.filter(period=period)

        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset.order_by("period", "name")


class ClassGroupViewSet(viewsets.ModelViewSet):
    serializer_class = ClassGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return ClassGroup.objects.all()

        if user.groups.filter(name="Professor").exists():
            return ClassGroup.objects.filter(teacher__user=user)

        return ClassGroup.objects.filter(classenrollment__student__user=user)


class ClassEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = ClassEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return ClassEnrollment.objects.all()

        if user.groups.filter(name="Professor").exists():
            return ClassEnrollment.objects.filter(class_group__teacher__user=user)

        return ClassEnrollment.objects.filter(student__user=user)


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = Grade.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = Grade.objects.filter(subject__classgroup__teacher__user=user).distinct()
        else:
            queryset = Grade.objects.filter(student__user=user)

        subject = self.request.query_params.get("subject")
        status_param = self.request.query_params.get("status")

        if subject:
            queryset = queryset.filter(subject__id=subject)

        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset.order_by("subject__name")


class AcademicCalendarViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicCalendarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AcademicCalendar.objects.all().order_by("start_date")

        event_type = self.request.query_params.get("event_type")
        active_only = self.request.query_params.get("active_only")

        if event_type:
            queryset = queryset.filter(event_type=event_type)

        if active_only == "true":
            today = timezone.localdate()
            queryset = queryset.filter(visible_until__gte=today)

        return queryset


class WeeklyScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = WeeklySchedule.objects.all()

        subject = self.request.query_params.get("subject")
        weekday = self.request.query_params.get("weekday")

        if subject:
            queryset = queryset.filter(subject__id=subject)

        if weekday:
            queryset = queryset.filter(weekday=weekday)

        return queryset.order_by("weekday", "start_time")