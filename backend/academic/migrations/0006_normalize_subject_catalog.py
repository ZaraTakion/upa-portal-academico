from django.db import migrations, models


def normalize_catalog_statuses(apps, schema_editor):
    Subject = apps.get_model("academic", "Subject")
    database = schema_editor.connection.alias
    valid_catalog_statuses = {"available", "locked"}

    for subject in Subject.objects.using(database).only(
        "pk", "legacy_status", "availability_status"
    ).iterator():
        subject.availability_status = (
            subject.legacy_status
            if subject.legacy_status in valid_catalog_statuses
            else "available"
        )
        Subject.objects.using(database).filter(pk=subject.pk).update(
            availability_status=subject.availability_status
        )


class Migration(migrations.Migration):
    dependencies = [
        ("academic", "0005_course_terms_assessments_attendance"),
    ]

    operations = [
        migrations.RenameField(
            model_name="subject",
            old_name="professor",
            new_name="legacy_professor",
        ),
        migrations.AlterField(
            model_name="subject",
            name="legacy_professor",
            field=models.CharField(
                blank=True,
                editable=False,
                help_text="Valor histórico. O docente atual pertence à oferta/turma.",
                max_length=100,
            ),
        ),
        migrations.RenameField(
            model_name="subject",
            old_name="status",
            new_name="legacy_status",
        ),
        migrations.AlterField(
            model_name="subject",
            name="legacy_status",
            field=models.CharField(
                blank=True,
                default="",
                editable=False,
                help_text="Status antigo, preservado somente para auditoria dos dados migrados.",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="subject",
            name="availability_status",
            field=models.CharField(
                choices=[
                    ("available", "Disponível"),
                    ("locked", "Bloqueada"),
                ],
                default="available",
                max_length=20,
            ),
        ),
        migrations.RunPython(
            normalize_catalog_statuses,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
