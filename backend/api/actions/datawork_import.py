"""Python file for datawork_import function that imports datasets from datawork"""

import csv
from datetime import timedelta

from django.utils.dateparse import parse_datetime
from django.db import transaction
from django.conf import settings

from backend.api.models import (
    Dataset,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
    SpectroConfig,
)


@transaction.atomic
def datawork_import(*, importer):
    """This function will import Datasets from datawork folder with importer user as owner"""
    dataset_names = Dataset.objects.values_list("name", flat=True)
    csv_dataset_names = []
    new_datasets = []

    # Check for new datasets
    with open(settings.DATASET_IMPORT_FOLDER / "datasets.csv") as csvfile:
        for dataset in csv.DictReader(csvfile):
            csv_dataset_names.append(dataset["name"])
            if dataset["name"] not in dataset_names:
                new_datasets.append(dataset)

    created_datasets = []
    for dataset in new_datasets:
        # Create dataset metadata
        datatype, _ = DatasetType.objects.update_or_create(
            name=dataset["dataset_type_name"],
            defaults={"desc": dataset["dataset_type_desc"]},
        )
        audio_folder = (
            settings.DATASET_IMPORT_FOLDER
            / dataset["folder_name"]
            / settings.DATASET_FILES_FOLDER
            / dataset["conf_folder"]
        )
        with open(audio_folder / "metadata.csv") as csvfile:
            audio_raw = list(csv.DictReader(csvfile))[0]
        audio_metadatum = AudioMetadatum.objects.create(
            num_channels=audio_raw["nchannels"],
            sample_rate_khz=audio_raw["dataset_fs"],
            sample_bits=audio_raw["sound_sample_size_in_bits"],
            start=parse_datetime(audio_raw["start_date"]),
            end=parse_datetime(audio_raw["end_date"]),
        )
        geo_metadatum, _ = GeoMetadatum.objects.update_or_create(
            name=dataset["location_name"], defaults={"desc": dataset["location_desc"]}
        )

        # Create dataset
        curr_dataset = Dataset.objects.create(
            name=dataset["name"],
            dataset_path=settings.DATASET_EXPORT_PATH / dataset["folder_name"],
            status=1,
            files_type=dataset["files_type"],
            dataset_type=datatype,
            dataset_conf=dataset["conf_folder"],
            start_date=audio_metadatum.start.date(),
            end_date=audio_metadatum.end.date(),
            audio_metadatum=audio_metadatum,
            geo_metadatum=geo_metadatum,
            owner=importer,
        )
        created_datasets.append(curr_dataset.id)

        # Create dataset_files
        with open(audio_folder / "timestamp.csv") as csvfile:
            for timestamp_data in csv.reader(csvfile):
                filename, start_timestamp = timestamp_data
                start = parse_datetime(start_timestamp)
                audio_metadatum = AudioMetadatum.objects.create(
                    start=start,
                    end=(
                        start
                        + timedelta(seconds=float(audio_raw["dataset_fileDuration"]))
                    ),
                )
                curr_dataset.files.create(
                    filename=filename,
                    filepath=settings.DATASET_FILES_FOLDER
                    / dataset["conf_folder"]
                    / filename,
                    size=0,
                    audio_metadatum=audio_metadatum,
                )

    # Check for new spectro configs
    datasets_to_check = Dataset.objects.filter(name__in=csv_dataset_names)
    for dataset in datasets_to_check:
        dataset_spectros = []
        dataset_folder = dataset.dataset_path.split("/")[-1]
        conf_folder = dataset.dataset_conf or ""
        spectro_csv_path = (
            settings.DATASET_IMPORT_FOLDER
            / dataset_folder
            / settings.DATASET_SPECTRO_FOLDER
            / conf_folder
            / "spectrograms.csv"
        )
        with open(spectro_csv_path) as csvfile:
            for spectro in csv.DictReader(csvfile):
                name = spectro.pop("name")
                dataset_spectros.append(
                    SpectroConfig.objects.update_or_create(name=name, defaults=spectro)[
                        0
                    ]
                )
        dataset.spectro_configs.set(dataset_spectros)

    return Dataset.objects.filter(id__in=created_datasets)
