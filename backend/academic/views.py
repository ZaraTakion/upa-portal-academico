from django.db.models import Case, Count, F, IntegerField, Q, Value, When
from django.utils import timezone
from rest_framework import viewsets

from core.permissions import (
    IsStaffOrReadOnly,
    IsStaffOrTeacherAcademicEditor,
    IsStaffOrTeacherGradeEditor,
    IsStudentProfileOwnerOrStaff,
)
from .models import (
    AcademicCalendar,
    AcademicTerm,
    Assessment,
    AssessmentResult,
    AttendanceRecord,
    ClassEnrollment,
    ClassGroup,
    Course,
    Grade,
    GradePolicy,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)
from .serializers import (
    AcademicCalendarSerializer,
    AcademicTermSerializer,
    AssessmentResultSerializer,
    AssessmentSerializer,
    AttendanceRecordSerializer,
    ClassEnrollmentSerializer,
    ClassGroupSerializer,
    CourseSerializer,
    GradeSerializer,
    GradePolicySerializer,
    StudentProfileSerializer,
    SubjectSerializer,
    TeacherProfileSerializer,
    WeeklyScheduleSerializer,
)


class GradePolicyViewSet(viewsets.ModelViewSet):
    serializer_class = GradePolicySerializer
    permission_classes = [IsStaffOrReadOnly]
    queryset = GradePolicy.objects.all().order_by("pk")


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsStaffOrReadOnly]
    queryset = Course.objects.all().order_by("name")


class AcademicTermViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicTermSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return AcademicTerm.objects.all()
        if user.groups.filter(name="Professor").exists():
            return AcademicTerm.objects.filter(class_groups__teacher__user=user).distinct()
        return AcademicTerm.objects.filter(
            class_groups__classenrollment__student__user=user
        ).distinct()


class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [IsStaffOrTeacherAcademicEditor]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = Assessment.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = Assessment.objects.filter(class_group__teacher__user=user)
        else:
            queryset = Assessment.objects.filter(
                class_group__classenrollment__student__user=user
            )
        class_group = self.request.query_params.get("class_group")
        if class_group:
            queryset = queryset.filter(class_group_id=class_group)
        return queryset.select_related(
            "class_group__subject", "class_group__teacher__user"
        ).order_by("due_date", "title")


class AssessmentResultViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentResultSerializer
    permission_classes = [IsStaffOrTeacherAcademicEditor]

    def get_queryset(self):
        user = self.request.user
        queryset = AssessmentResult.objects.select_related(
            "assessment__class_group__teacher__user",
            "assessment__class_group__subject",
            "student__user",
        )
        if user.is_staff:
            return queryset
        if user.groups.filter(name="Professor").exists():
            return queryset.filter(assessment__class_group__teacher__user=user)
        return queryset.filter(
            assessment__class_group__classenrollment__student__user=user,
            student__user=user,
        ).distinct()

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        class_group = self.request.query_params.get("class_group")
        assessment = self.request.query_params.get("assessment")
        if class_group:
            queryset = queryset.filter(assessment__class_group_id=class_group)
        if assessment:
            queryset = queryset.filter(assessment_id=assessment)
        return queryset

    def perform_create(self, serializer):
        serializer.save(graded_at=timezone.now())


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsStaffOrTeacherAcademicEditor]

    def get_queryset(self):
        user = self.request.user
        queryset = AttendanceRecord.objects.select_related(
            "class_group__subject", "student__user", "recorded_by"
        )
        if user.is_staff:
            return queryset
        if user.groups.filter(name="Professor").exists():
            return queryset.filter(class_group__teacher__user=user)
        return queryset.filter(
            class_group__classenrollment__student__user=user,
            student__user=user,
        ).distinct()

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        class_group = self.request.query_params.get("class_group")
        held_at = self.request.query_params.get("date")
        if class_group:
            queryset = queryset.filter(class_group_id=class_group)
        if held_at:
            queryset = queryset.filter(held_at__date=held_at)
        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsStudentProfileOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return StudentProfile.objects.select_related("user", "course").all()
        if user.groups.filter(name="Professor").exists():
            return StudentProfile.objects.filter(
                classenrollment__class_group__teacher__user=user
            ).distinct()
        return StudentProfile.objects.filter(user=user).select_related("user", "course")


class TeacherProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return TeacherProfile.objects.all()
        return TeacherProfile.objects.filter(user=user)


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsStaffOrReadOnly]

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
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ClassGroup.objects.all().select_related("subject", "teacher__user").annotate(students_count=Count("classenrollment"))
        if user.groups.filter(name="Professor").exists():
            return ClassGroup.objects.filter(teacher__user=user).select_related("subject", "teacher__user").annotate(students_count=Count("classenrollment"))
        return ClassGroup.objects.filter(classenrollment__student__user=user).select_related("subject", "teacher__user").annotate(students_count=Count("classenrollment"))


class ClassEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = ClassEnrollmentSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = ClassEnrollment.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = ClassEnrollment.objects.filter(class_group__teacher__user=user)
        else:
            queryset = ClassEnrollment.objects.filter(student__user=user)

        class_group = self.request.query_params.get("class_group")
        status_param = self.request.query_params.get("status")
        if class_group:
            queryset = queryset.filter(class_group_id=class_group)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.select_related(
            "student__user", "class_group__subject"
        ).order_by("student__user__last_name", "student__user__first_name", "pk")


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [IsStaffOrTeacherGradeEditor]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = Grade.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = Grade.objects.filter(
                Q(
                    class_group__teacher__user=user,
                    class_group__classenrollment__student_id=F("student_id"),
                )
                | Q(
                    class_group__isnull=True,
                    subject__classgroup__teacher__user=user,
                    subject__classgroup__classenrollment__student_id=F("student_id"),
                )
            ).distinct()
        else:
            queryset = Grade.objects.filter(student__user=user)

        subject = self.request.query_params.get("subject")
        status_param = self.request.query_params.get("status")
        if subject:
            queryset = queryset.filter(subject__id=subject)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset.select_related("student__user", "subject", "class_group").order_by("subject__name")


class AcademicCalendarViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicCalendarSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = AcademicCalendar.objects.all().order_by("start_date")
        event_type = self.request.query_params.get("event_type")
        active_only = self.request.query_params.get("active_only")
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if active_only == "true":
            today = timezone.localdate()
            queryset = queryset.filter(Q(visible_until__isnull=True) | Q(visible_until__gte=today))
        return queryset


class WeeklyScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyScheduleSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = WeeklySchedule.objects.all()
        elif user.groups.filter(name="Professor").exists():
            queryset = WeeklySchedule.objects.filter(class_group__teacher__user=user)
        else:
            queryset = WeeklySchedule.objects.filter(
                class_group__classenrollment__student__user=user
            )

        subject = self.request.query_params.get("subject")
        weekday = self.request.query_params.get("weekday")
        if subject:
            queryset = queryset.filter(subject__id=subject)
        if weekday:
            queryset = queryset.filter(weekday=weekday)
        weekday_order = Case(
            *[
                When(weekday=value, then=Value(index))
                for index, (value, _) in enumerate(WeeklySchedule.WEEKDAY_CHOICES)
            ],
            output_field=IntegerField(),
        )
        return queryset.select_related(
            "class_group__subject", "teacher__user", "subject"
        ).order_by(weekday_order, "start_time")
