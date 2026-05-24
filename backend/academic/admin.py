from django.contrib import admin

from .models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "registration", "course", "semester")
    search_fields = ("user__username", "registration", "course")


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "employee_code", "department", "title")
    search_fields = ("user__username", "employee_code", "department")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "workload", "professor")
    search_fields = ("name", "code", "professor")


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
    list_display = ("student", "subject", "grade", "absence", "created_at")
    search_fields = ("student__user__username", "subject__name")


@admin.register(AcademicCalendar)
class AcademicCalendarAdmin(admin.ModelAdmin):
    list_display = ("title", "event_date")
    search_fields = ("title",)