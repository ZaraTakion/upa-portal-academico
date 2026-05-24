from django.contrib.auth.models import User
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    registration = models.CharField(max_length=20, unique=True)
    course = models.CharField(max_length=100)
    semester = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.registration}"


class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_code = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=100, default="Professor")

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.employee_code}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    workload = models.PositiveIntegerField()
    professor = models.CharField(max_length=100)

    def __str__(self):
        return self.name


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
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    grade = models.DecimalField(max_digits=4, decimal_places=2)
    absence = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "subject")

    def __str__(self):
        return f"{self.student.user.username} - {self.subject.name} - {self.grade}"


class AcademicCalendar(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateField()

    def __str__(self):
        return self.title