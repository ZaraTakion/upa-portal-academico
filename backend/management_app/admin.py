from django.contrib import admin
from .models import AcademicFile, ContactMessage, FinancialInvoice


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "destination", "contact_type", "return_channel", "subject", "created_at")
    search_fields = ("user__username", "subject", "message")
    list_filter = ("contact_type", "return_channel")


@admin.register(AcademicFile)
class AcademicFileAdmin(admin.ModelAdmin):
    list_display = ("user", "subject", "title", "file_type", "uploaded_at")
    search_fields = ("user__username", "title", "subject__name")
    list_filter = ("file_type",)


@admin.register(FinancialInvoice)
class FinancialInvoiceAdmin(admin.ModelAdmin):
    list_display = ("user", "description", "amount", "due_date", "status", "payment_method")
    search_fields = ("user__username", "description")
    list_filter = ("status", "payment_method")