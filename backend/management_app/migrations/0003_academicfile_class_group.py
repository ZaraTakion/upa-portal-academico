from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("academic", "0003_rename_event_date_academiccalendar_start_date_and_more"),
        ("management_app", "0002_academicfile_file_type_academicfile_subject_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="academicfile",
            name="class_group",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="academic.classgroup",
            ),
        ),
    ]
