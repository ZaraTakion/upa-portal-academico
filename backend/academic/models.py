from django.contrib.auth.models import User
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    registration = models.CharField(max_length=20, unique=True)
    course = models.CharField(max_length=100)
    semester = models.PositiveIntegerField()

    cpf = models.CharField(max_length=14, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    mother_name = models.CharField(max_length=150, blank=True)
    father_name = models.CharField(max_length=150, blank=True)
    guardian_name = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.registration}"


class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    employee_code = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=100, default="Professor")
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.employee_code}"


class Subject(models.Model):
    STATUS_CHOICES = [
        ("available", "Disponível"),
        ("current", "Em andamento"),
        ("completed", "Concluída"),
        ("failed", "Reprovada"),
        ("locked", "Bloqueada"),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    workload = models.PositiveIntegerField()
    professor = models.CharField(max_length=100)
    period = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")

    def __str__(self):
        return f"{self.name} - {self.code}"


class ClassGroup(models.Model):
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE)
    semester = models.CharField(max_length=20)
    year = models.PositiveIntegerField()

    class Meta:
        unique_together = ("name", "subject", "semester", "year")

    def __str__(self):
        return f"{self.name} - {self.subject.name}"


class ClassEnrollment(models.Model):
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("class_group", "student")

    def __str__(self):
        return f"{self.student.user.username} - {self.class_group.name}"


class Grade(models.Model):
    STATUS_CHOICES = [
        ("approved", "Aprovado"),
        ("attention", "Em atenção"),
        ("failed", "Reprovado"),
        ("pending", "Sem nota"),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    grade = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    absence = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "subject")

    def save(self, *args, **kwargs):
        if self.grade is None:
            self.status = "pending"
        elif self.grade >= 7:
            self.status = "approved"
        elif self.grade >= 5:
            self.status = "attention"
        else:
            self.status = "failed"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.username} - {self.subject.name} - {self.grade}"


class AcademicCalendar(models.Model):
    EVENT_TYPE_CHOICES = [
        ("class", "Aula"),
        ("holiday", "Feriado"),
        ("exam", "Prova"),
        ("final_exam", "Prova Final"),
        ("enrollment", "Matrícula"),
        ("event", "Evento"),
        ("notice", "Comunicado"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default="event")

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    visible_until = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.start_date}"


class WeeklySchedule(models.Model):
    WEEKDAY_CHOICES = [
        ("monday", "Segunda-feira"),
        ("tuesday", "Terça-feira"),
        ("wednesday", "Quarta-feira"),
        ("thursday", "Quinta-feira"),
        ("friday", "Sexta-feira"),
        ("saturday", "Sábado"),
    ]

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, null=True, blank=True)

    weekday = models.CharField(max_length=20, choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return f"{self.subject.name} - {self.get_weekday_display()} {self.start_time}"