import uuid

from django.contrib.auth.models import User
from django.db import models

from academic.models import ClassGroup, Subject


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

    STATUS_CHOICES = [
        ("open", "Aberto"),
        ("in_progress", "Em atendimento"),
        ("answered", "Respondido"),
        ("closed", "Encerrado"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    protocol = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    destination = models.CharField(max_length=100, default="Secretaria Acadêmica")
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES, default="academic")
    return_channel = models.CharField(max_length=20, choices=RETURN_CHANNELS, default="email")
    subject = models.CharField(max_length=200)
    message = models.TextField()
    response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    response_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("user", "status"), name="management_contact_user_status_idx")]

    def __str__(self):
        return str(self.protocol)


class AcademicFile(models.Model):
    FILE_TYPES = [
        ("material", "Material do professor"),
        ("assignment", "Atividade para entrega"),
        ("submission", "Entrega do aluno"),
        ("document", "Documento acadêmico"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default="submission")
    file = models.FileField(upload_to="academic_files/")
    assignment = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submissions",
    )
    due_at = models.DateTimeField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
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
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, null=True, blank=True, default=None)

    def __str__(self):
        return f"{self.user.username} - {self.description}"