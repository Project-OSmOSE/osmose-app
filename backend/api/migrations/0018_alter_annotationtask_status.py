# Generated by Django 3.2.16 on 2023-04-26 10:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0017_auto_20230428_1141"),
    ]

    operations = [
        migrations.AlterField(
            model_name="annotationtask",
            name="status",
            field=models.IntegerField(
                choices=[
                    (0, "Created"),
                    (1, "Started"),
                    (2, "Finished"),
                    (3, "Unassigned"),
                ],
                default=0,
            ),
        ),
    ]
