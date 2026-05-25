from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "notification_type", "is_read", "expires_at", "created_at")
    search_fields = ("user__username", "title", "message")
    list_filter = ("notification_type", "is_read")