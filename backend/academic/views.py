from datetime import datetime, time

from django.db import transaction
from django.db.models import Case, Count, F, IntegerField, Prefetch, Q, Value, When
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from core.permissions import (
    IsStaffOrReadOnly,
    IsStaffOrTeacherAcademicEditor,
    IsStaffOrTeacherGradeEditor,
    IsStudentProfileOwnerOrStaff,
)
from core.viewsets import PortalModelViewSet

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
    AttendanceBatchSerializer,
    AttendanceRecordSerializer,
    ClassEnrollmentSerializer,
    ClassGroupSerializer,
    CourseSerializer,
    GradePolicySerializer,
    GradeSerializer,
    StudentProfileSerializer,
    SubjectSerializer,
    TeacherProfileSerializer,
    WeeklyScheduleSerializer,
)


class GradePolicyViewSet(PortalModelViewSet):
    serializer_class = GradePolicySerializer
    permission_classes = [IsStaffOrReadOnly]
    queryset = GradePolicy.objects.all().order_by("pk")


class CourseViewSet(PortalModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsStaffOrReadOnly]
    queryset = Course.objects.all().order_by("name")


class AcademicTermViewSet(PortalModelViewSet):
    queryset = AcademicTerm.objects.none()
    serializer_class = AcademicTermSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            return AcademicTerm.objects.all()
        if user.groups.filter(name="Professor").exists():
            return AcademicTerm.objects.filter(class_groups__teacher__user=user).distinct()
        return AcademicTerm.objects.filter(
            class_groups__classenrollment__student__user=user
        ).distinct()


class AssessmentViewSet(PortalModelViewSet):
    integer_filters = ('class_group',)
    queryset = Assessment.objects.none()
    serializer_class = AssessmentSerializer
    permission_classes = [IsStaffOrTeacherAcademicEditor]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
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


class AssessmentResultViewSet(PortalModelViewSet):
    integer_filters = ('class_group', 'assessment')
    queryset = AssessmentResult.objects.none()
    serializer_class = AssessmentResultSerializer
    permission_classes = [IsStaffOrTeacherAcademicEditor]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
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

    def perform_update(self, serializer):
        serializer.save(graded_at=timezone.now())


class AttendanceRecordViewSet(PortalModelViewSet):
    date_filters = ("date",)
    integer_filters = ('class_group',)
    queryset = AttendanceRecord.objects.none()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsStaffOrTeacherAcademicEditor]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
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

    @extend_schema(request=AttendanceBatchSerializer, responses=AttendanceRecordSerializer(many=True))
    @action(detail=False, methods=["post"], url_path="batch")
    def batch(self, request):
        serializer = AttendanceBatchSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        group, day = data["class_group"], data["date"]
        held_at = timezone.make_aware(datetime.combine(day, time(12)))
        saved = []
        with transaction.atomic():
            # Serialize roster submissions for the same offering.
            ClassGroup.objects.select_for_update().get(pk=group.pk)
            for item in data["records"]:
                existing = AttendanceRecord.objects.filter(class_group=group, student_id=item["student"], held_at__date=day)
                if existing.count() > 1:
                    raise ValidationError({"date": "Há várias sessões nesta data. Edite os registros individualmente pela API."})
                record = existing.first()
                if record:
                    record.present = item["present"]
                    record.recorded_by = request.user
                    record.save(update_fields={"present", "recorded_by"})
                else:
                    record = AttendanceRecord.objects.create(class_group=group, student_id=item["student"], held_at=held_at, present=item["present"], recorded_by=request.user)
                saved.append(record.pk)
        records = self.get_queryset().filter(pk__in=saved)
        return Response(self.get_serializer(records, many=True).data)


class StudentProfileViewSet(PortalModelViewSet):
    queryset = StudentProfile.objects.none()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsStudentProfileOwnerOrStaff]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            return StudentProfile.objects.select_related("user", "course").all()
        if user.groups.filter(name="Professor").exists():
            return StudentProfile.objects.filter(
                classenrollment__class_group__teacher__user=user
            ).select_related("user", "course").distinct()
        return StudentProfile.objects.filter(user=user).select_related("user", "course")


class TeacherProfileViewSet(PortalModelViewSet):
    queryset = TeacherProfile.objects.none()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            return TeacherProfile.objects.select_related("user").all()
        return TeacherProfile.objects.filter(user=user).select_related("user")


class SubjectViewSet(PortalModelViewSet):
    integer_filters = ('period',)
    queryset = Subject.objects.none()
    serializer_class = SubjectSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        queryset = Subject.objects.all()
        search = self.request.query_params.get("search")
        period = self.request.query_params.get("period")
        status_param = self.request.query_params.get("status")
        if search:
            queryset = queryset.filter(name__icontains=search)
        if period:
            queryset = queryset.filter(period=period)
        if status_param:
            queryset = queryset.filter(availability_status=status_param)
        offerings = ClassGroup.objects.select_related(
            "teacher__user", "term"
        ).order_by("-term__code", "name")
        return queryset.prefetch_related(
            Prefetch(
                "classgroup_set",
                queryset=offerings,
                to_attr="offerings_for_subject",
            )
        ).order_by("period", "name")


class ClassGroupViewSet(PortalModelViewSet):
    queryset = ClassGroup.objects.none()
    serializer_class = ClassGroupSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        user = self.request.user
        if user.is_staff:
            return ClassGroup.objects.all().select_related("subject", "teacher__user", "term").annotate(students_count=Count("classenrollment")).order_by("-year", "semester", "name", "pk")
        if user.groups.filter(name="Professor").exists():
            return ClassGroup.objects.filter(teacher__user=user).select_related("subject", "teacher__user", "term").annotate(students_count=Count("classenrollment")).order_by("-year", "semester", "name", "pk")
        return ClassGroup.objects.filter(pk__in=ClassEnrollment.objects.filter(student__user=user).values("class_group_id")).select_related("subject", "teacher__user", "term").annotate(students_count=Count("classenrollment")).order_by("-year", "semester", "name", "pk")


class ClassEnrollmentViewSet(PortalModelViewSet):
    integer_filters = ('class_group',)
    queryset = ClassEnrollment.objects.none()
    serializer_class = ClassEnrollmentSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
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


class GradeViewSet(PortalModelViewSet):
    integer_filters = ('class_group', 'subject')
    queryset = Grade.objects.none()
    serializer_class = GradeSerializer
    permission_classes = [IsStaffOrTeacherGradeEditor]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
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
        class_group = self.request.query_params.get("class_group")
        if subject:
            queryset = queryset.filter(subject__id=subject)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if class_group:
            if not class_group.isdecimal():
                return queryset.none()
            queryset = queryset.filter(class_group_id=int(class_group))
        return queryset.select_related("student__user", "subject", "class_group").order_by("subject__name", "attempt")


class AcademicCalendarViewSet(PortalModelViewSet):
    queryset = AcademicCalendar.objects.none()
    serializer_class = AcademicCalendarSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
        queryset = AcademicCalendar.objects.all().order_by("start_date")
        event_type = self.request.query_params.get("event_type")
        active_only = self.request.query_params.get("active_only")
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if active_only == "true":
            today = timezone.localdate()
            queryset = queryset.filter(Q(visible_until__isnull=True) | Q(visible_until__gte=today))
        return queryset


class WeeklyScheduleViewSet(PortalModelViewSet):
    integer_filters = ('subject',)
    queryset = WeeklySchedule.objects.none()
    serializer_class = WeeklyScheduleSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return self.queryset.none()
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
