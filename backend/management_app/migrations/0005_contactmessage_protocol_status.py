import uuid

from django.db import migrations, models


def populate_protocols(apps, schema_editor):
    ContactMessage = apps.get_model("management_app", "ContactMessage")
    database = schema_editor.connection.alias
    for ticket in ContactMessage.objects.using(database).only("pk").iterator():
        ContactMessage.objects.using(database).filter(pk=ticket.pk).update(protocol=uuid.uuid4())


class Migration(migrations.Migration):
    dependencies = [
        ("management_app", "0004_financialinvoice_payment_method_optional"),
    ]

    operations = [
        migrations.AddField(
            model_name="contactmessage",
            name="protocol",
            field=models.UUIDField(blank=True, null=True),
        ),
        migrations.RunPython(populate_protocols, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="contactmessage",
            name="protocol",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AddField(
            model_name="contactmessage",
            name="status",
            field=models.CharField(
                choices=[
                    ("open", "Aberto"),
                    ("in_progress", "Em atendimento"),
                    ("answered", "Respondido"),
                    ("closed", "Encerrado"),
                ],
                default="open",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="contactmessage",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="contactmessage",
            name="response_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name="contactmessage",
            index=models.Index(fields=["user", "status"], name="management_contact_user_status_idx"),
        ),
        migrations.AlterModelOptions(
            name="contactmessage",
            options={"ordering": ("-created_at",)},
        ),
    ]
