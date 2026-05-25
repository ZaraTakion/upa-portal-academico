from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("notice", "Comunicado"),
        ("internship", "Estágio"),
        ("job", "Vaga de emprego"),
        ("event", "Evento"),
        ("academic", "Acadêmico"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default="academic")
    is_read = models.BooleanField(default=False)
    expires_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title