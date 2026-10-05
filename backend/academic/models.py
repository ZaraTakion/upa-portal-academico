from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Course(models.Model):
    name = models.CharField(max_length=100, unique=True)
    duration_semesters = models.PositiveSmallIntegerField(default=8)

    def __str__(self):
        return self.name


class AcademicTerm(models.Model):
    code = models.CharField(max_length=20, unique=True)
    starts_on = models.DateField(null=True, blank=True)
    ends_on = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ("-code",)

    def __str__(self):
        return self.code


class GradePolicy(models.Model):
    passing_score = models.DecimalField(max_digits=4, decimal_places=2, default=7)
    attention_score = models.DecimalField(max_digits=4, decimal_places=2, default=5)
    maximum_absences = models.PositiveSmallIntegerField(null=True, blank=True)

    def __str__(self):
        return f"Aprovação a partir de {self.passing_score}"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    registration = models.CharField(max_length=20, unique=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name="students",
    )
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
    term = models.ForeignKey(
        AcademicTerm,
        on_delete=models.PROTECT,
        related_name="class_groups",
        blank=True,
    )
    semester = models.CharField(max_length=20)
    year = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("name", "subject", "term"),
                name="uniq_classgroup_subject_term",
            )
        ]

    def save(self, *args, **kwargs):
        if not self.term_id:
            semester_code = self.semester.strip() or "1"
            term_code = (
                semester_code
                if "." in semester_code
                else f"{self.year}.{semester_code}"
            )
            self.term, _ = AcademicTerm.objects.get_or_create(code=term_code)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.subject.name}"


class ClassEnrollment(models.Model):
    STATUS_CHOICES = [
        ("active", "Ativa"),
        ("completed", "Concluída"),
        ("failed", "Reprovada"),
        ("withdrawn", "Cancelada"),
    ]

    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("class_group", "student"),
                name="uniq_student_class_enrollment",
            )
        ]
        indexes = [
            models.Index(fields=("student", "status"), name="academic_cl_student_165531_idx"),
            models.Index(fields=("class_group", "status"), name="academic_cl_class_g_156a35_idx"),
        ]

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
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="grades",
    )
    attempt = models.PositiveSmallIntegerField(default=1)
    grade = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    absence = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("student", "subject", "class_group", "attempt"),
                name="uniq_student_subject_offering_attempt",
            )
        ]
        indexes = [
            models.Index(fields=("student", "subject"), name="academic_gr_student_eb06bd_idx"),
            models.Index(fields=("class_group", "status"), name="academic_gr_class_g_1eadd9_idx"),
        ]

    def save(self, *args, **kwargs):
        policy = GradePolicy.objects.order_by("pk").first()
        passing_score = policy.passing_score if policy else 7
        attention_score = policy.attention_score if policy else 5

        if self.grade is None:
            self.status = "pending"
        elif self.grade >= passing_score:
            self.status = "approved"
        elif self.grade >= attention_score:
            self.status = "attention"
        else:
            self.status = "failed"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.username} - {self.subject.name} - {self.grade}"


class Assessment(models.Model):
    CATEGORY_CHOICES = [
        ("n1", "N1"),
        ("n2", "N2"),
        ("project", "Projeto"),
        ("recovery", "Recuperação"),
        ("other", "Outra"),
    ]

    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=1)
    maximum_score = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("due_date", "title")
        indexes = [models.Index(fields=("class_group", "due_date"), name="academic_as_class_g_26e3e4_idx")]

    def __str__(self):
        return f"{self.class_group} - {self.title}"


class AssessmentResult(models.Model):
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="results",
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="assessment_results",
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("assessment", "student"),
                name="uniq_assessment_result_student",
            )
        ]
        indexes = [models.Index(fields=("student", "assessment"), name="academic_as_student_093a27_idx")]

    def __str__(self):
        return f"{self.student} - {self.assessment}"


class AttendanceRecord(models.Model):
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    held_at = models.DateTimeField()
    present = models.BooleanField(default=True)
    notes = models.CharField(max_length=255, blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="recorded_attendance",
    )

    class Meta:
        ordering = ("-held_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("class_group", "student", "held_at"),
                name="uniq_attendance_student_session",
            )
        ]
        indexes = [models.Index(fields=("class_group", "held_at"), name="academic_at_class_g_a61062_idx")]

    def __str__(self):
        return f"{self.student} - {self.held_at:%Y-%m-%d}"


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

    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="weekly_schedules",
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, null=True, blank=True)
    weekday = models.CharField(max_length=20, choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return f"{self.subject.name} - {self.get_weekday_display()} {self.start_time}"
