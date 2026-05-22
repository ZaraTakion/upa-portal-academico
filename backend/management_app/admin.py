from django.contrib import admin

from .models import AcademicFile, ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "subject", "created_at")
    search_fields = ("user__username", "subject", "message")


@admin.register(AcademicFile)
class AcademicFileAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "uploaded_at")
    search_fields = ("user__username", "title")