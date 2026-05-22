from django.contrib import admin

from .models import AcademicCalendar, Grade, StudentProfile, Subject


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "registration", "course", "semester")
    search_fields = ("user__username", "registration", "course")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "workload", "professor")
    search_fields = ("name", "code", "professor")


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "grade", "absence", "created_at")
    search_fields = ("student__user__username", "subject__name")


@admin.register(AcademicCalendar)
class AcademicCalendarAdmin(admin.ModelAdmin):
    list_display = ("title", "event_date")
    search_fields = ("title",)