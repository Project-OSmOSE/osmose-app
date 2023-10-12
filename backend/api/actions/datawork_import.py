"""Python file for datawork_import function that imports datasets from datawork"""

import csv
import os

from datetime import timedelta, datetime

from django.utils.dateparse import parse_datetime
from django.db import transaction
from django.conf import settings

from backend.api.models import (
    Dataset,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
    DatasetFile,
    SpectroConfig,
    WindowType,
)


@transaction.atomic
def datawork_import(*, wanted_datasets, importer):
    """This function will import Datasets from datawork folder with importer user as owner"""
    # TODO : break up this process to remove code smell and in order to help with unit testing
    # pylint: disable=too-many-locals, duplicate-code
    current_dataset_names = Dataset.objects.values_list("name", flat=True)
    wanted_dataset_names = [dataset["name"] for dataset in wanted_datasets]
    csv_dataset_names = []
    new_datasets = []

    # Check for new datasets
    with open(
        settings.DATASET_IMPORT_FOLDER / "datasets.csv", encoding="utf-8"
    ) as csvfile:
        for dataset in csv.DictReader(csvfile):
            dname = dataset["name"]
            csv_dataset_names.append(dname)
            if dname in wanted_dataset_names and dname not in current_dataset_names:
                new_datasets.append(dataset)

    created_datasets = []
    for dataset in new_datasets:
        # Create dataset metadata
        ## defaults : value to update
        datatype, _ = DatasetType.objects.update_or_create(
            name=dataset["dataset_type_name"],
            defaults={"desc": dataset["dataset_type_desc"]},
        )
        dataset_folder = dataset["folder_name"]

        # Audio
        audio_folder = (
            settings.DATASET_IMPORT_FOLDER
            / dataset["folder_name"]
            / settings.DATASET_FILES_FOLDER
            / dataset["conf_folder"]
        )
        with open(audio_folder / "metadata.csv", encoding="utf-8") as csvfile:
            audio_raw = list(csv.DictReader(csvfile))[0]
        audio_metadatum = AudioMetadatum.objects.create(
            channel_count=audio_raw["channel_count"],
            dataset_sr=audio_raw["dataset_sr"],
            sample_bits=audio_raw["sample_bits"],
            start=parse_datetime(audio_raw["start_date"]),
            end=parse_datetime(audio_raw["end_date"]),
        )

        # Geo Metadata
        geo_metadatum, _ = GeoMetadatum.objects.update_or_create(
            name=dataset["location_name"], defaults={"desc": dataset["location_desc"]}
        )

        conf_folder = dataset["conf_folder"] or ""
        dataset_path = settings.DATASET_EXPORT_PATH / dataset_folder
        dataset_path = dataset_path.as_posix()
        # Create dataset
        curr_dataset = Dataset.objects.create(
            name=dataset["name"],
            dataset_path=dataset_path,
            status=1,
            files_type=dataset["files_type"],
            dataset_type=datatype,
            dataset_conf=conf_folder,
            start_date=audio_metadatum.start.date(),
            end_date=audio_metadatum.end.date(),
            audio_metadatum=audio_metadatum,
            geo_metadatum=geo_metadatum,
            owner=importer,
            created_at=datetime.today(),
        )
        created_datasets.append(curr_dataset.id)

        # Add Spectro Config
        dataset_spectros = []
        dataset_folder = dataset_path.split("/")[-1]

        conf_folder_path = (
            settings.DATASET_IMPORT_FOLDER
            / dataset_folder
            / settings.DATASET_SPECTRO_FOLDER
            / conf_folder
        )

        # Search all sub folder, each sub folder have one metadata.csv
        for one_spectro_folder in os.scandir(conf_folder_path):
            if one_spectro_folder.is_dir():
                spectro_csv_path = f"{one_spectro_folder.path}/metadata.csv"
            else:
                continue

            with open(spectro_csv_path, encoding="utf-8") as csvfile:
                for spectro in csv.DictReader(csvfile):
                    name = f"{spectro['nfft']}_{spectro['window_size']}_{spectro['overlap']}"
                    window_type = WindowType.objects.filter(
                        name=spectro["window_type"]
                    ).first()
                    spectro["window_type"] = window_type

                    spectro_needed = {
                        key: value
                        for (key, value) in spectro.items()
                        if key in settings.FIELD_SPECTRO_CONFIG_NEEDED
                    }
                    dataset_spectros.append(
                        SpectroConfig.objects.update_or_create(
                            name=name, defaults=spectro_needed
                        )[0]
                    )
            curr_dataset.spectro_configs.set(dataset_spectros)

        dataset_files = []
        # Create dataset_files
        with open(audio_folder / "timestamp.csv", encoding="utf-8") as csvfile:
            for timestamp_data in csv.DictReader(csvfile):
                start = parse_datetime(timestamp_data["timestamp"])
                # TODO we should first bulk create AudioMetadatum and then bulk create DatasetFiles
                audio_metadatum = AudioMetadatum.objects.create(
                    start=start,
                    end=(
                        start
                        + timedelta(
                            seconds=float(audio_raw["audio_file_dataset_duration"])
                        )
                    ),
                )
                dataset_files.append(
                    DatasetFile(
                        dataset=curr_dataset,
                        filename=timestamp_data["filename"],
                        filepath=settings.DATASET_FILES_FOLDER
                        / dataset["conf_folder"]
                        / timestamp_data["filename"],
                        size=0,
                        audio_metadatum=audio_metadatum,
                    )
                )
        curr_dataset.files.bulk_create(dataset_files)

    return Dataset.objects.filter(id__in=created_datasets)
