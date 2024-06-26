# Generated by Django 3.2.23 on 2024-04-16 09:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0038_merge_20240410_1746"),
    ]

    operations = [
        migrations.AddField(
            model_name="spectroconfig",
            name="audio_file_dataset_overlap",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="gain_dB",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="number_spectra",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="peak_voltage",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="sensitivity_dB",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="spectro_duration",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="spectroconfig",
            name="temporal_resolution",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
