from django.conf import settings
from django.contrib.auth.models import User
from decimal import Decimal, ROUND_HALF_UP

from django.db import models, transaction


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

    def save(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        with transaction.atomic(using=using):
            super().save(*args, **kwargs)
            refresh_grade_statuses(using=using)

    def delete(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        with transaction.atomic(using=using):
            result = super().delete(*args, **kwargs)
            refresh_grade_statuses(using=using)
            return result

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
    AVAILABILITY_CHOICES = [
        ("available", "Disponível"),
        ("locked", "Bloqueada"),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    workload = models.PositiveIntegerField()
    period = models.PositiveIntegerField(default=1)
    availability_status = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default="available",
    )
    legacy_professor = models.CharField(
        max_length=100,
        blank=True,
        editable=False,
        help_text="Valor histórico. O docente atual pertence à oferta/turma.",
    )
    legacy_status = models.CharField(
        max_length=20,
        blank=True,
        default="",
        editable=False,
        help_text="Status antigo, preservado somente para auditoria dos dados migrados.",
    )

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
        unique_together = (("name", "subject", "semester", "year"),)

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
        using = kwargs.get("using") or self._state.db
        policy_manager = GradePolicy.objects.using(using) if using else GradePolicy.objects
        policy = policy_manager.order_by("pk").first()
        if self.class_group_id:
            attendance_manager = (
                AttendanceRecord.objects.using(using) if using else AttendanceRecord.objects
            )
            self.absence = attendance_manager.filter(
                class_group_id=self.class_group_id,
                student_id=self.student_id,
                present=False,
            ).count()
            if kwargs.get("update_fields") is not None:
                kwargs["update_fields"] = set(kwargs["update_fields"]) | {"absence", "status"}
        self.status = grade_status_for(self.grade, self.absence, policy)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.username} - {self.subject.name} - {self.grade}"


def grade_status_for(grade, absence, policy):
    if (
        policy
        and policy.maximum_absences is not None
        and absence > policy.maximum_absences
    ):
        return "failed"

    if grade is None:
        return "pending"

    passing_score = policy.passing_score if policy else 7
    attention_score = policy.attention_score if policy else 5
    if grade >= passing_score:
        return "approved"
    if grade >= attention_score:
        return "attention"
    return "failed"


def refresh_grade_statuses(using=None):
    policy_manager = GradePolicy.objects.using(using) if using else GradePolicy.objects
    grade_manager = Grade.objects.using(using) if using else Grade.objects
    policy = policy_manager.order_by("pk").first()
    batch = []

    for grade in grade_manager.only("pk", "grade", "absence", "status").iterator(
        chunk_size=500
    ):
        grade.status = grade_status_for(grade.grade, grade.absence, policy)
        batch.append(grade)
        if len(batch) == 500:
            grade_manager.bulk_update(batch, ["status"], batch_size=500)
            batch.clear()

    if batch:
        grade_manager.bulk_update(batch, ["status"], batch_size=500)


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

    def save(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        assessment_manager = Assessment.objects.using(using) if using else Assessment.objects
        result_manager = AssessmentResult.objects.using(using) if using else AssessmentResult.objects
        previous_group_id = (
            assessment_manager.filter(pk=self.pk).values_list("class_group_id", flat=True).first()
            if self.pk
            else None
        )
        affected_students = set(
            result_manager.filter(assessment_id=self.pk).values_list("student_id", flat=True)
        ) if self.pk else set()

        with transaction.atomic(using=using):
            super().save(*args, **kwargs)
            affected_students.update(
                result_manager.filter(assessment_id=self.pk).values_list("student_id", flat=True)
            )
            group_ids = {self.class_group_id}
            if previous_group_id:
                group_ids.add(previous_group_id)
            for class_group_id in group_ids:
                for student_id in affected_students:
                    sync_assessment_grades(student_id, class_group_id, using=using)

    def delete(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        result_manager = AssessmentResult.objects.using(using) if using else AssessmentResult.objects
        student_ids = set(
            result_manager.filter(assessment_id=self.pk).values_list("student_id", flat=True)
        )
        class_group_id = self.class_group_id
        with transaction.atomic(using=using):
            result = super().delete(*args, **kwargs)
            for student_id in student_ids:
                sync_assessment_grades(student_id, class_group_id, using=using)
            return result

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

    def save(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        result_manager = AssessmentResult.objects.using(using) if using else AssessmentResult.objects
        assessment_manager = Assessment.objects.using(using) if using else Assessment.objects
        previous = (
            result_manager.filter(pk=self.pk)
            .values("student_id", "assessment__class_group_id")
            .first()
            if self.pk
            else None
        )
        current_group_id = assessment_manager.filter(pk=self.assessment_id).values_list(
            "class_group_id", flat=True
        ).first()

        with transaction.atomic(using=using):
            super().save(*args, **kwargs)
            affected = {(self.student_id, current_group_id)}
            if previous:
                affected.add((previous["student_id"], previous["assessment__class_group_id"]))
            for student_id, class_group_id in affected:
                sync_assessment_grades(student_id, class_group_id, using=using)

    def delete(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        result_manager = AssessmentResult.objects.using(using) if using else AssessmentResult.objects
        result = result_manager.filter(pk=self.pk).values(
            "student_id", "assessment__class_group_id"
        ).first()
        with transaction.atomic(using=using):
            deleted = super().delete(*args, **kwargs)
            if result:
                sync_assessment_grades(
                    result["student_id"],
                    result["assessment__class_group_id"],
                    using=using,
                )
            return deleted

    def __str__(self):
        return f"{self.student} - {self.assessment}"


def sync_assessment_grades(student_id, class_group_id, using=None):
    if not student_id or not class_group_id:
        return

    grade_manager = Grade.objects.using(using) if using else Grade.objects
    result_manager = AssessmentResult.objects.using(using) if using else AssessmentResult.objects
    assessment_manager = Assessment.objects.using(using) if using else Assessment.objects
    subject_id = ClassGroup.objects.using(using).filter(pk=class_group_id).values_list(
        "subject_id", flat=True
    ).first() if using else ClassGroup.objects.filter(pk=class_group_id).values_list(
        "subject_id", flat=True
    ).first()
    if not subject_id:
        return

    for attempt in (1, 2):
        results = result_manager.filter(
            student_id=student_id,
            assessment__class_group_id=class_group_id,
            score__isnull=False,
        )
        if attempt == 2:
            results = results.filter(assessment__category="recovery")
        else:
            results = results.exclude(assessment__category="recovery")

        rows = list(results.values(
            "score", "assessment__maximum_score", "assessment__weight"
        ))
        existing_grade = grade_manager.filter(
            student_id=student_id,
            subject_id=subject_id,
            class_group_id=class_group_id,
            attempt=attempt,
        ).first()
        if not rows and existing_grade is None:
            continue

        weighted_total = Decimal("0")
        total_weight = Decimal("0")
        for row in rows:
            maximum_score = row["assessment__maximum_score"]
            weight = row["assessment__weight"]
            if maximum_score <= 0 or weight <= 0:
                continue
            normalized_score = row["score"] * Decimal("10") / maximum_score
            weighted_total += normalized_score * weight
            total_weight += weight

        calculated_grade = (
            (weighted_total / total_weight).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if total_weight
            else None
        )
        grade, _ = grade_manager.get_or_create(
            student_id=student_id,
            subject_id=subject_id,
            class_group_id=class_group_id,
            attempt=attempt,
            defaults={"grade": calculated_grade},
        )
        if grade.grade != calculated_grade:
            grade.grade = calculated_grade
            grade.save(using=using, update_fields={"grade"})


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

    def save(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        manager = AttendanceRecord.objects.using(using) if using else AttendanceRecord.objects
        previous = (
            manager.filter(pk=self.pk)
            .values("student_id", "class_group_id")
            .first()
            if self.pk
            else None
        )

        with transaction.atomic(using=using):
            super().save(*args, **kwargs)
            affected = {(self.student_id, self.class_group_id)}
            if previous:
                affected.add((previous["student_id"], previous["class_group_id"]))
            for student_id, class_group_id in affected:
                sync_grade_absences(student_id, class_group_id, using=using)

    def delete(self, *args, **kwargs):
        using = kwargs.get("using") or self._state.db
        student_id, class_group_id = self.student_id, self.class_group_id
        with transaction.atomic(using=using):
            result = super().delete(*args, **kwargs)
            sync_grade_absences(student_id, class_group_id, using=using)
            return result

    def __str__(self):
        return f"{self.student} - {self.held_at:%Y-%m-%d}"


def sync_grade_absences(student_id, class_group_id, using=None):
    if not student_id or not class_group_id:
        return

    attendance_manager = AttendanceRecord.objects.using(using) if using else AttendanceRecord.objects
    grade_manager = Grade.objects.using(using) if using else Grade.objects
    absences = attendance_manager.filter(
        student_id=student_id,
        class_group_id=class_group_id,
        present=False,
    ).count()

    for grade in grade_manager.filter(
        student_id=student_id,
        class_group_id=class_group_id,
    ).only("pk", "student_id", "class_group_id", "grade", "absence", "status"):
        grade.absence = absences
        grade.save(using=using, update_fields={"absence", "status"})


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
