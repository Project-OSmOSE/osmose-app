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
    DatasetFilePrecalculatedAnnotation,
    AnnotationTag,
)


def get_new_datasets(wanted_datasets):
    """Get new datasets available"""
    current_dataset_names = Dataset.objects.values_list("name", flat=True)
    wanted_dataset_names = [dataset["name"] for dataset in wanted_datasets]
    csv_dataset_names = []
    new_datasets = []
    with open(
        settings.DATASET_IMPORT_FOLDER / "datasets.csv", encoding="utf-8"
    ) as csvfile:
        for dataset in csv.DictReader(csvfile):
            dataset_name = dataset["name"]
            csv_dataset_names.append(dataset_name)
            if (
                dataset_name in wanted_dataset_names
                and dataset_name not in current_dataset_names
            ):
                new_datasets.append(dataset)
    return new_datasets


def get_audio_metadatum(audio_raw):
    """Get audio metadatum for a current dataset"""
    return AudioMetadatum.objects.create(
        channel_count=audio_raw["channel_count"],
        dataset_sr=audio_raw["dataset_sr"],
        sample_bits=audio_raw["sample_bits"],
        start=parse_datetime(audio_raw["start_date"]),
        end=parse_datetime(audio_raw["end_date"]),
    )


def get_geo_metadatum(dataset):
    """Get geo metadatum for a current dataset"""
    data, _ = GeoMetadatum.objects.update_or_create(
        name=dataset["location_name"], defaults={"desc": dataset["location_desc"]}
    )
    return data


def get_needed_spectrograms(spectro_folder):
    """Get spectrograms for current dataset
    Search all sub folder, each sub folder have one metadata.csv"""
    needed_spectrograms = []
    for one_spectro_folder in os.scandir(spectro_folder):
        if one_spectro_folder.is_dir():
            spectro_csv_path = f"{one_spectro_folder.path}/metadata.csv"
        else:
            continue

        with open(spectro_csv_path, encoding="utf-8") as csvfile:
            for spectro in csv.DictReader(csvfile):
                name = (
                    f"{spectro['nfft']}_{spectro['window_size']}_{spectro['overlap']}"
                )
                window_type = WindowType.objects.filter(
                    name=spectro["window_type"]
                ).first()
                spectro["window_type"] = window_type

                spectro_needed = {
                    key: value
                    for (key, value) in spectro.items()
                    if key in settings.FIELD_SPECTRO_CONFIG_NEEDED
                }
                needed_spectrograms.append(
                    {
                        "name": name,
                        "value": spectro_needed,
                    }
                )
    return needed_spectrograms


def import_precalculated_annotations(
    current_dataset, spectro_folder, needed_spectro_conf
):
    """Import precalculated annotations if exists for given dataset"""
    for spectro_conf in needed_spectro_conf:
        spectro_conf = spectro_conf["value"]
        spectro_conf_folder = (
            spectro_conf["nfft"]
            + "_"
            + spectro_conf["window_size"]
            + "_"
            + spectro_conf["overlap"]
        )
        path = spectro_folder / spectro_conf_folder / "precalculated_annotations.csv"
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as csvfile:
            files_for_current_dataset = DatasetFile.objects.filter(
                dataset=current_dataset
            )
            for data in csv.DictReader(csvfile):
                dataset_file = files_for_current_dataset.filter(
                    filename=data["filename"]
                ).first()
                if dataset_file is None:
                    continue
                annotation = DatasetFilePrecalculatedAnnotation.objects.create(
                    file=dataset_file,
                    start_time=data["start_time"],
                    end_time=data["end_time"],
                    start_frequency=data["start_frequency"],
                    end_frequency=data["end_frequency"],
                    annotation_tag=AnnotationTag.objects.filter(
                        name=data["annotation"]
                    ).first(),
                    annotation_label=data["annotation"],
                    algorithm=data["algorithm"],
                    is_box=data["is_box"],
                    confidence_level=data["confidence_level"] or None,
                )
                print("annotation", annotation)


def get_dataset_files(current_dataset, audio_folder, conf_folder, duration):
    """Get dataset files for current dataset"""
    dataset_files = []
    with open(audio_folder / "timestamp.csv", encoding="utf-8") as csvfile:
        for timestamp_data in csv.DictReader(csvfile):
            start = parse_datetime(timestamp_data["timestamp"])
            end = start + timedelta(seconds=float(duration))
            # TODO we should first bulk create AudioMetadatum and then bulk create DatasetFiles
            audio_metadatum = AudioMetadatum.objects.create(
                start=start,
                end=end,
            )
            file = DatasetFile(
                dataset=current_dataset,
                filename=timestamp_data["filename"],
                filepath=settings.DATASET_FILES_FOLDER
                / conf_folder
                / timestamp_data["filename"],
                size=0,
                audio_metadatum=audio_metadatum,
            )
            dataset_files.append(file)
    return dataset_files


@transaction.atomic
def datawork_import(*, wanted_datasets, importer):
    """This function will import Datasets from datawork folder with importer user as owner"""
    # TODO : break up this process to remove code smell and in order to help with unit testing
    # pylint: disable=too-many-locals

    new_datasets = get_new_datasets(wanted_datasets)

    created_datasets = []
    for dataset in new_datasets:
        # Create dataset metadata
        #  defaults : value to update
        datatype, _ = DatasetType.objects.update_or_create(
            name=dataset["dataset_type_name"],
            defaults={"desc": dataset["dataset_type_desc"]},
        )
        dataset_folder = dataset["folder_name"]

        conf_folder = dataset["conf_folder"] or ""
        audio_folder = (
            settings.DATASET_IMPORT_FOLDER
            / dataset["folder_name"]
            / settings.DATASET_FILES_FOLDER
            / conf_folder
        )
        spectro_folder = (
            settings.DATASET_IMPORT_FOLDER
            / dataset["folder_name"]
            / settings.DATASET_SPECTRO_FOLDER
            / conf_folder
        )

        # Audio
        with open(audio_folder / "metadata.csv", encoding="utf-8") as csvfile:
            audio_raw = list(csv.DictReader(csvfile))[0]
        audio_metadatum = get_audio_metadatum(audio_raw)

        dataset_path = settings.DATASET_EXPORT_PATH / dataset_folder
        # Create dataset
        curr_dataset = Dataset.objects.create(
            name=dataset["name"],
            dataset_path=dataset_path.as_posix(),
            status=1,
            files_type=dataset["files_type"],
            dataset_type=datatype,
            dataset_conf=conf_folder,
            start_date=audio_metadatum.start.date(),
            end_date=audio_metadatum.end.date(),
            audio_metadatum=audio_metadatum,
            geo_metadatum=get_geo_metadatum(dataset),
            owner=importer,
        )
        created_datasets.append(curr_dataset.id)

        needed_spectro = get_needed_spectrograms(spectro_folder)
        for spectro in needed_spectro:
            new_spectro = SpectroConfig.objects.update_or_create(
                name=spectro["name"], defaults=spectro["value"], dataset=curr_dataset
            )[0]
            new_spectro.save()

        dataset_files = get_dataset_files(
            current_dataset=curr_dataset,
            audio_folder=audio_folder,
            conf_folder=dataset["conf_folder"],
            duration=audio_raw["audio_file_dataset_duration"],
        )
        curr_dataset.files.bulk_create(dataset_files)

        import_precalculated_annotations(
            current_dataset=curr_dataset,
            spectro_folder=spectro_folder,
            needed_spectro_conf=needed_spectro,
        )

    return Dataset.objects.filter(id__in=created_datasets)
