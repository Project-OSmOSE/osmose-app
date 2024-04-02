"""Annotation campaign utils to add annotators to campaign"""

from django.db.models import Count
from rest_framework import serializers

from backend.api.models import (
    AnnotationCampaign,
    User,
)


def create_campaign_with_annotators(
    campaign: AnnotationCampaign, goal: int, annotators: list[User]
) -> AnnotationCampaign:
    """Finalize campaign creation"""
    file_count = sum(
        campaign.datasets.annotate(Count("files")).values_list(
            "files__count", flat=True
        )
    )
    total_goal = file_count * goal
    annotator_goal, remainder = divmod(total_goal, len(annotators))
    for annotator in User.objects.filter(id__in=annotators):
        files_target = annotator_goal
        if remainder > 0:
            files_target += 1
            remainder -= 1
        campaign.add_annotator(annotator, files_target)
    return campaign


def check_annotation_goal(attrs: dict) -> None:
    """Max for annotation_goal"""
    annotators_nb = len(attrs["annotators"])
    if attrs["annotation_goal"] > annotators_nb:
        error = f"Ensure this value is lower than or equal to the number of annotators {annotators_nb}"
        raise serializers.ValidationError({"annotation_goal": error})


def check_spectro_configs_in_datasets(attrs: dict) -> None:
    """Validates that chosen spectros correspond to chosen datasets"""
    spectro_configs = attrs["spectro_configs"]  # type: list[SpectroConfig]
    datasets = attrs["datasets"]  # type: list[Dataset]
    bad_vals = []
    for spectro in spectro_configs:
        if spectro.dataset not in datasets:
            bad_vals.append(str(spectro))
    if bad_vals:
        error = f"{bad_vals} not valid ids for spectro configs of given datasets ({[str(d) for d in datasets]})"
        raise serializers.ValidationError({"spectro_configs": error})
