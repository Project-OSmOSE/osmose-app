# Generated by Django 3.2.25 on 2024-09-11 17:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("metadatax", "0022_auto_20240911_1902"),
        ("osmosewebsite", "0021_auto_20240909_0918"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="metadatax_project",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="website_project",
                to="acquisition.project",
            ),
        ),
    ]
