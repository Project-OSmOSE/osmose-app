"""Python file for datawork_import function that imports datasets from datawork"""

import csv
import os

from datetime import timedelta

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
            audio_file_count=audio_raw["audio_file_count"]
            if "audio_file_count" in audio_raw
            else None,
            audio_file_dataset_duration=audio_raw["audio_file_dataset_duration"]
            if "audio_file_dataset_duration" in audio_raw
            else None,
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
        )
        created_datasets.append(curr_dataset.id)

        # Add Spectro Config
        dataset_folder = dataset_path.split("datawork/dataset/")[1]

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

                    is_instrument_normalization = (
                        spectro["data_normalization"] == "instrument"
                    )
                    is_zscore_normalization = spectro["data_normalization"] == "zscore"

                    new_spectro = SpectroConfig.objects.update_or_create(
                        name=name,
                        dataset=curr_dataset,
                        nfft=spectro["nfft"],
                        window_size=spectro["window_size"],
                        overlap=spectro["overlap"],
                        zoom_level=spectro["zoom_level"],
                        spectro_normalization=spectro["spectro_normalization"],
                        data_normalization=spectro["data_normalization"],
                        hp_filter_min_freq=spectro["hp_filter_min_freq"],
                        colormap=spectro["colormap"],
                        dynamic_min=spectro["dynamic_min"],
                        dynamic_max=spectro["dynamic_max"],
                        window_type=WindowType.objects.get_or_create(
                            name=spectro["window_type"]
                        )[0],
                        frequency_resolution=spectro["frequency_resolution"],
                        temporal_resolution=spectro["temporal_resolution"]
                        if "temporal_resolution" in spectro
                        else None,
                        spectro_duration=spectro["spectro_duration"]
                        if "spectro_duration" in spectro
                        else None,
                        audio_file_dataset_overlap=spectro["audio_file_dataset_overlap"]
                        if "audio_file_dataset_overlap" in spectro
                        else None,
                        zscore_duration=spectro["zscore_duration"]
                        if is_zscore_normalization
                        else None,
                        sensitivity_dB=spectro["sensitivity_dB"]
                        if is_instrument_normalization and "sensitivity_dB" in spectro
                        else None,
                        peak_voltage=spectro["peak_voltage"]
                        if is_instrument_normalization and "peak_voltage" in spectro
                        else None,
                        gain_dB=spectro["gain_dB"]
                        if is_instrument_normalization and "gain_dB" in spectro
                        else None,
                    )[0]
                    new_spectro.save()

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
