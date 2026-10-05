import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management_app", "0005_contactmessage_protocol_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="academicfile",
            name="file_type",
            field=models.CharField(
                choices=[
                    ("material", "Material do professor"),
                    ("assignment", "Atividade para entrega"),
                    ("submission", "Entrega do aluno"),
                    ("document", "Documento acadêmico"),
                ],
                default="submission",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="academicfile",
            name="assignment",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="submissions",
                to="management_app.academicfile",
            ),
        ),
        migrations.AddField(
            model_name="academicfile",
            name="due_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="academicfile",
            name="feedback",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="academicfile",
            name="reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
