from django.contrib import admin

from .models import (
    AcademicCalendar,
    AcademicTerm,
    Assessment,
    AssessmentResult,
    AttendanceRecord,
    ClassEnrollment,
    ClassGroup,
    Course,
    GradePolicy,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "registration", "course", "semester", "phone")
    search_fields = ("user__username", "user__first_name", "user__last_name", "registration", "course__name")


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "employee_code", "department", "title")
    search_fields = ("user__username", "employee_code", "department")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "period",
        "availability_status",
        "workload",
        "legacy_professor",
    )
    search_fields = ("name", "code", "legacy_professor")
    list_filter = ("period", "availability_status")
    readonly_fields = ("legacy_professor", "legacy_status")


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "teacher", "term", "semester", "year")
    search_fields = ("name", "subject__name", "teacher__user__username")


@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("class_group", "student", "status", "enrolled_at")
    search_fields = ("class_group__name", "student__user__username")


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "class_group", "attempt", "grade", "absence", "status", "created_at")
    search_fields = ("student__user__username", "subject__name")
    list_filter = ("status",)


@admin.register(AcademicCalendar)
class AcademicCalendarAdmin(admin.ModelAdmin):
    list_display = ("title", "event_type", "start_date", "end_date", "visible_until")
    search_fields = ("title", "description")
    list_filter = ("event_type",)


@admin.register(WeeklySchedule)
class WeeklyScheduleAdmin(admin.ModelAdmin):
    list_display = ("class_group", "subject", "weekday", "start_time", "end_time", "location")
    search_fields = ("subject__name", "location")
    list_filter = ("weekday",)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "duration_semesters")
    search_fields = ("name",)


@admin.register(AcademicTerm)
class AcademicTermAdmin(admin.ModelAdmin):
    list_display = ("code", "starts_on", "ends_on", "is_current")
    list_filter = ("is_current",)
    search_fields = ("code",)


@admin.register(GradePolicy)
class GradePolicyAdmin(admin.ModelAdmin):
    list_display = ("passing_score", "attention_score", "maximum_absences")


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("title", "class_group", "category", "weight", "due_date")
    list_filter = ("category", "class_group__term")
    search_fields = ("title", "class_group__subject__name", "class_group__name")


@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ("assessment", "student", "score", "graded_at")
    search_fields = ("assessment__title", "student__user__username")
    list_filter = ("assessment__class_group__term",)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("class_group", "student", "held_at", "present", "recorded_by")
    list_filter = ("present", "class_group__term")
    search_fields = ("student__user__username", "class_group__name")
