from django.contrib.auth.models import User
from django.db import models

from academic.models import Subject


class ContactMessage(models.Model):
    CONTACT_TYPES = [
        ("academic", "Acadêmico"),
        ("financial", "Financeiro"),
        ("technical", "Suporte técnico"),
        ("secretary", "Secretaria"),
        ("other", "Outro"),
    ]

    RETURN_CHANNELS = [
        ("email", "E-mail"),
        ("phone", "Telefone"),
        ("whatsapp", "WhatsApp"),
        ("portal", "Portal"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=100, default="Secretaria Acadêmica")
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES, default="academic")
    return_channel = models.CharField(max_length=20, choices=RETURN_CHANNELS, default="email")
    subject = models.CharField(max_length=200)
    message = models.TextField()
    response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject


class AcademicFile(models.Model):
    FILE_TYPES = [
        ("material", "Material do professor"),
        ("submission", "Entrega do aluno"),
        ("document", "Documento acadêmico"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default="submission")
    file = models.FileField(upload_to="academic_files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class FinancialInvoice(models.Model):
    STATUS_CHOICES = [
        ("paid", "Pago"),
        ("pending", "Pendente"),
        ("overdue", "Vencido"),
    ]

    PAYMENT_METHODS = [
        ("pix", "Pix"),
        ("boleto", "Boleto"),
        ("credit_card", "Cartão de crédito"),
        ("debit_card", "Cartão de débito"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="pix")

    def __str__(self):
        return f"{self.user.username} - {self.description}"