from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("management_app", "0003_academicfile_class_group"),
    ]

    operations = [
        migrations.AlterField(
            model_name="financialinvoice",
            name="payment_method",
            field=models.CharField(
                blank=True,
                choices=[
                    ("pix", "Pix"),
                    ("boleto", "Boleto"),
                    ("credit_card", "Cartão de crédito"),
                    ("debit_card", "Cartão de débito"),
                ],
                default=None,
                max_length=20,
                null=True,
            ),
        ),
    ]
