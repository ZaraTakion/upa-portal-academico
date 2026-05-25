from django.contrib import admin

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


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "registration", "course", "semester", "phone")
    search_fields = ("user__username", "user__first_name", "user__last_name", "registration", "course")


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "employee_code", "department", "title")
    search_fields = ("user__username", "employee_code", "department")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "period", "status", "workload", "professor")
    search_fields = ("name", "code", "professor")
    list_filter = ("period", "status")


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "teacher", "semester", "year")
    search_fields = ("name", "subject__name", "teacher__user__username")


@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("class_group", "student")
    search_fields = ("class_group__name", "student__user__username")


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "grade", "absence", "status", "created_at")
    search_fields = ("student__user__username", "subject__name")
    list_filter = ("status",)


@admin.register(AcademicCalendar)
class AcademicCalendarAdmin(admin.ModelAdmin):
    list_display = ("title", "event_type", "start_date", "end_date", "visible_until")
    search_fields = ("title", "description")
    list_filter = ("event_type",)


@admin.register(WeeklySchedule)
class WeeklyScheduleAdmin(admin.ModelAdmin):
    list_display = ("subject", "weekday", "start_time", "end_time", "location")
    search_fields = ("subject__name", "location")
    list_filter = ("weekday",)