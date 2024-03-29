# Generated by Django 3.2.16 on 2023-04-18 12:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0012_auto_20230417_1701"),
    ]

    operations = [
        migrations.CreateModel(
            name="WindowType",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255, unique=True)),
            ],
            options={
                "db_table": "window_type",
            },
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="window_type",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.windowtype",
            ),
        ),
    ]
