"""Check for new spectro configs on all datasets present in CSV"""
# pylint: disable=R0801
import csv

from django.conf import settings

from backend.api.models import (
    Dataset,
    SpectroConfig,
)


def check_new_spectro_config_validity():
    """Check for new spectro configs on all datasets present in CSV"""

    csv_dataset_names = []
    # Check for new datasets
    with open(
        settings.DATASET_IMPORT_FOLDER / "datasets.csv", encoding="utf-8"
    ) as csvfile:
        for dataset in csv.DictReader(csvfile):
            dname = dataset["name"]
            csv_dataset_names.append(dname)

    # Check for new spectro configs on all datasets present in CSV
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
        with open(spectro_csv_path, encoding="utf-8") as csvfile:
            for spectro in csv.DictReader(csvfile):
                name = spectro.pop("name")
                dataset_spectros.append(
                    SpectroConfig.objects.update_or_create(name=name, defaults=spectro)[
                        0
                    ]
                )
        dataset.spectro_configs.set(dataset_spectros)

    return True
