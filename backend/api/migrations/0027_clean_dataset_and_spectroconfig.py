# Generated by Django 3.2.23 on 2023-11-22 14:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0026_add_dataset_new_ForeignKey"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="dataset",
            name="spectro_configs",
        ),
        migrations.AlterField(
            model_name="spectroconfig",
            name="dataset",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="spectro_configs",
                to="api.dataset",
            ),
        ),
    ]
