from django.db import migrations, models
import django.db.models.deletion


def attach_unambiguous_class_groups(apps, schema_editor):
    WeeklySchedule = apps.get_model("academic", "WeeklySchedule")
    ClassGroup = apps.get_model("academic", "ClassGroup")
    database = schema_editor.connection.alias

    for schedule in WeeklySchedule.objects.using(database).filter(class_group__isnull=True):
        groups = ClassGroup.objects.using(database).filter(subject_id=schedule.subject_id)
        if schedule.teacher_id:
            groups = groups.filter(teacher_id=schedule.teacher_id)
        group_ids = list(groups.values_list("id", flat=True)[:2])
        if len(group_ids) == 1:
            WeeklySchedule.objects.using(database).filter(pk=schedule.pk).update(
                class_group_id=group_ids[0]
            )


class Migration(migrations.Migration):
    dependencies = [
        ("academic", "0003_rename_event_date_academiccalendar_start_date_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="weeklyschedule",
            name="class_group",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="weekly_schedules",
                to="academic.classgroup",
            ),
        ),
        migrations.RunPython(
            attach_unambiguous_class_groups,
            migrations.RunPython.noop,
        ),
    ]
