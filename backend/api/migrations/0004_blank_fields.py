# Generated by Django 3.2 on 2021-10-15 13:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_delete_job"),
    ]

    operations = [
        migrations.AlterField(
            model_name="annotationresult",
            name="end_frequency",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="annotationresult",
            name="end_time",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="annotationresult",
            name="start_frequency",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="annotationresult",
            name="start_time",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="dutycycle_rdm",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="dutycycle_rim",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="end",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="gain_db",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="gain_rel",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="num_channels",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="sample_bits",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="sample_rate_khz",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="start",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="audiometadatum",
            name="total_samples",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="dataset",
            name="audio_metadatum",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.audiometadatum",
            ),
        ),
        migrations.AlterField(
            model_name="dataset",
            name="geo_metadatum",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.geometadatum",
            ),
        ),
        migrations.AlterField(
            model_name="dataset",
            name="tabular_metadatum",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.tabularmetadatum",
            ),
        ),
        migrations.AlterField(
            model_name="datasetfile",
            name="audio_metadatum",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.audiometadatum",
            ),
        ),
        migrations.AlterField(
            model_name="datasetfile",
            name="tabular_metadatum",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.tabularmetadatum",
            ),
        ),
    ]
