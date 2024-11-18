# Generated by Django 3.2.25 on 2024-09-30 14:59

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0050_alter_annotationtask"),
    ]

    operations = [
        migrations.RemoveField(model_name="annotationtask", name="status"),
        migrations.RenameField(
            model_name="annotationtask", old_name="status_new", new_name="status"
        ),
        migrations.AlterField(
            model_name="annotationtask",
            name="status",
            field=models.TextField(
                choices=[("C", "Created"), ("S", "Started"), ("F", "Finished")],
                default="C",
            ),
        ),
        migrations.AlterModelTable(
            name="annotationtask",
            table=None,
        ),
    ]