"""Check for new spectro configs on all datasets present in CSV"""
# pylint: disable=duplicate-code
import csv
import re
import os

from django.conf import settings

from backend.api.models import (
    Dataset,
    SpectroConfig,
    WindowType,
)


def check_new_spectro_config_errors():
    """Check for new spectro configs on all datasets present in CSV"""
    # pylint: disable=too-many-locals
    try:
        check_error = []
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
                    dataset.spectro_configs.set(dataset_spectros)

    except FileNotFoundError as error:
        regex = "dataset/(.*)/processed"
        buggy_dataset = re.findall(regex, str(error))
        buggy_dataset = buggy_dataset[0] if buggy_dataset else "FAILED NAME DETECTION"
        check_error = {
            "error_lines": [
                "Successful import. Reload (F5) this page to see it.",
                f"But an another dataset config spectro ({buggy_dataset}) can't be updated :",
                f"{error}",
            ]
        }

    return check_error
