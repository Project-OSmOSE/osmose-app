"""Check for new spectro configs on all datasets present in CSV"""
import csv
import re

from django.conf import settings

from backend.api.models import (
    Dataset,
    SpectroConfig,
)
from .datawork_import import get_needed_spectrograms


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

            needed_spectro = get_needed_spectrograms(
                (
                    settings.DATASET_IMPORT_FOLDER
                    / dataset.dataset_path.split("datawork/dataset/")[1]
                    / settings.DATASET_SPECTRO_FOLDER
                    / dataset.dataset_conf
                    or ""
                )
            )
            for spectro in needed_spectro:
                dataset_spectros.append(
                    SpectroConfig.objects.update_or_create(
                        name=spectro["name"], defaults=spectro["value"], dataset=dataset
                    )[0]
                )

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
