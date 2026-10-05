import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


def populate_courses_and_terms(apps, schema_editor):
    StudentProfile = apps.get_model("academic", "StudentProfile")
    Course = apps.get_model("academic", "Course")
    AcademicTerm = apps.get_model("academic", "AcademicTerm")
    ClassGroup = apps.get_model("academic", "ClassGroup")
    Grade = apps.get_model("academic", "Grade")
    database = schema_editor.connection.alias

    for profile in StudentProfile.objects.using(database).all().iterator():
        name = (profile.course or "").strip() or "Curso não informado"
        course, _ = Course.objects.using(database).get_or_create(name=name)
        StudentProfile.objects.using(database).filter(pk=profile.pk).update(
            course_ref_id=course.pk
        )

    for group in ClassGroup.objects.using(database).all().iterator():
        semester = (group.semester or "").strip() or "1"
        code = semester if "." in semester else f"{group.year}.{semester}"
        term, _ = AcademicTerm.objects.using(database).get_or_create(code=code)
        ClassGroup.objects.using(database).filter(pk=group.pk).update(term_id=term.pk)

    for grade in Grade.objects.using(database).all().iterator():
        groups = ClassGroup.objects.using(database).filter(
            subject_id=grade.subject_id,
            classenrollment__student_id=grade.student_id,
        ).values_list("id", flat=True).distinct()[:2]
        group_ids = list(groups)
        if len(group_ids) == 1:
            Grade.objects.using(database).filter(pk=grade.pk).update(
                class_group_id=group_ids[0]
            )


def restore_course_names(apps, schema_editor):
    StudentProfile = apps.get_model("academic", "StudentProfile")
    database = schema_editor.connection.alias
    for profile in StudentProfile.objects.using(database).select_related("course_ref"):
        if profile.course_ref_id:
            StudentProfile.objects.using(database).filter(pk=profile.pk).update(
                course=profile.course_ref.name
            )


class Migration(migrations.Migration):
    dependencies = [
        ("academic", "0004_weeklyschedule_class_group"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
                ("duration_semesters", models.PositiveSmallIntegerField(default=8)),
            ],
        ),
        migrations.CreateModel(
            name="AcademicTerm",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=20, unique=True)),
                ("starts_on", models.DateField(blank=True, null=True)),
                ("ends_on", models.DateField(blank=True, null=True)),
                ("is_current", models.BooleanField(default=False)),
            ],
            options={"ordering": ("-code",)},
        ),
        migrations.CreateModel(
            name="GradePolicy",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("passing_score", models.DecimalField(decimal_places=2, default=7, max_digits=4)),
                ("attention_score", models.DecimalField(decimal_places=2, default=5, max_digits=4)),
                ("maximum_absences", models.PositiveSmallIntegerField(blank=True, null=True)),
            ],
        ),
        migrations.AddField(
            model_name="studentprofile",
            name="course_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="students", to="academic.course"),
        ),
        migrations.AddField(
            model_name="classgroup",
            name="term",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="class_groups", to="academic.academicterm"),
        ),
        migrations.AddField(
            model_name="grade",
            name="class_group",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="grades", to="academic.classgroup"),
        ),
        migrations.AddField(
            model_name="grade",
            name="attempt",
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="classenrollment",
            name="status",
            field=models.CharField(choices=[("active", "Ativa"), ("completed", "Concluída"), ("failed", "Reprovada"), ("withdrawn", "Cancelada")], default="active", max_length=20),
        ),
        migrations.AddField(
            model_name="classenrollment",
            name="enrolled_at",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.RunPython(populate_courses_and_terms, restore_course_names),
        migrations.RemoveField(model_name="studentprofile", name="course"),
        migrations.RenameField(model_name="studentprofile", old_name="course_ref", new_name="course"),
        migrations.AlterField(
            model_name="studentprofile",
            name="course",
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="students", to="academic.course"),
        ),
        migrations.AlterField(
            model_name="classgroup",
            name="term",
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.PROTECT, related_name="class_groups", to="academic.academicterm"),
        ),
        migrations.AlterUniqueTogether(name="classenrollment", unique_together=set()),
        migrations.AlterUniqueTogether(name="classgroup", unique_together=set()),
        migrations.AlterUniqueTogether(name="grade", unique_together=set()),
        migrations.AddConstraint(
            model_name="classgroup",
            constraint=models.UniqueConstraint(fields=("name", "subject", "term"), name="uniq_classgroup_subject_term"),
        ),
        migrations.AddConstraint(
            model_name="classenrollment",
            constraint=models.UniqueConstraint(fields=("class_group", "student"), name="uniq_student_class_enrollment"),
        ),
        migrations.AddConstraint(
            model_name="grade",
            constraint=models.UniqueConstraint(fields=("student", "subject", "class_group", "attempt"), name="uniq_student_subject_offering_attempt"),
        ),
        migrations.AddIndex(
            model_name="classenrollment",
            index=models.Index(fields=["student", "status"], name="academic_cl_student_165531_idx"),
        ),
        migrations.AddIndex(
            model_name="classenrollment",
            index=models.Index(fields=["class_group", "status"], name="academic_cl_class_g_156a35_idx"),
        ),
        migrations.AddIndex(
            model_name="grade",
            index=models.Index(fields=["student", "subject"], name="academic_gr_student_eb06bd_idx"),
        ),
        migrations.AddIndex(
            model_name="grade",
            index=models.Index(fields=["class_group", "status"], name="academic_gr_class_g_1eadd9_idx"),
        ),
        migrations.CreateModel(
            name="Assessment",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("category", models.CharField(choices=[("n1", "N1"), ("n2", "N2"), ("project", "Projeto"), ("recovery", "Recuperação"), ("other", "Outra")], default="other", max_length=20)),
                ("weight", models.DecimalField(decimal_places=2, default=1, max_digits=5)),
                ("maximum_score", models.DecimalField(decimal_places=2, default=10, max_digits=5)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("class_group", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assessments", to="academic.classgroup")),
            ],
            options={"ordering": ("due_date", "title")},
        ),
        migrations.AddIndex(
            model_name="assessment",
            index=models.Index(fields=["class_group", "due_date"], name="academic_as_class_g_26e3e4_idx"),
        ),
        migrations.CreateModel(
            name="AssessmentResult",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("feedback", models.TextField(blank=True)),
                ("graded_at", models.DateTimeField(blank=True, null=True)),
                ("assessment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="results", to="academic.assessment")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assessment_results", to="academic.studentprofile")),
            ],
        ),
        migrations.AddConstraint(
            model_name="assessmentresult",
            constraint=models.UniqueConstraint(fields=("assessment", "student"), name="uniq_assessment_result_student"),
        ),
        migrations.AddIndex(
            model_name="assessmentresult",
            index=models.Index(fields=["student", "assessment"], name="academic_as_student_093a27_idx"),
        ),
        migrations.CreateModel(
            name="AttendanceRecord",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("held_at", models.DateTimeField()),
                ("present", models.BooleanField(default=True)),
                ("notes", models.CharField(blank=True, max_length=255)),
                ("class_group", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attendance_records", to="academic.classgroup")),
                ("recorded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="recorded_attendance", to=settings.AUTH_USER_MODEL)),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attendance_records", to="academic.studentprofile")),
            ],
            options={"ordering": ("-held_at",)},
        ),
        migrations.AddConstraint(
            model_name="attendancerecord",
            constraint=models.UniqueConstraint(fields=("class_group", "student", "held_at"), name="uniq_attendance_student_session"),
        ),
        migrations.AddIndex(
            model_name="attendancerecord",
            index=models.Index(fields=["class_group", "held_at"], name="academic_at_class_g_a61062_idx"),
        ),
    ]
