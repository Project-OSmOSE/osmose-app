# Generated by Django 3.2.25 on 2025-04-17 07:54

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0076_spectrogram_tuning"),
    ]

    operations = [
        migrations.AddField(
            model_name="annotationresult",
            name="created_at",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="annotationresult",
            name="is_update_of",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="updated_to",
                to="api.annotationresult",
            ),
        ),
    ]
