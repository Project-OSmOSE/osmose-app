"""Annotation campaign update DRF serializers file"""
# pylint: disable=W0223
from django.db.models import Count
from rest_framework import serializers

from backend.api.models import User
from backend.utils.validators import valid_model_ids


class AnnotationCampaignAddAnnotatorsSerializer(serializers.Serializer):
    """
    Serializer meant to update AnnotationCampaign with new annotators and corresponding tasks.

    If annotation_goal (the number of files wanted to be annotated) is not given then the whole
    dataset will be targeted.

    The parameter annotation_method is 0 for sequential and 1 for random.
    """

    annotators = serializers.ListField(
        child=serializers.IntegerField(), validators=[valid_model_ids(User)]
    )
    annotation_goal = serializers.IntegerField(min_value=0)

    def update(self, instance, validated_data):
        files_target = validated_data["annotation_goal"]
        if files_target == 0:
            files_target = sum(
                instance.datasets.annotate(Count("files")).values_list(
                    "files__count", flat=True
                )
            )
        for annotator in User.objects.filter(id__in=validated_data["annotators"]):
            instance.add_annotator(annotator, files_target)
        return instance
