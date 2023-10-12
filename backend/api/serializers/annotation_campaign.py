"""Annotation campaign DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method
from datetime import datetime
from django.db.models import Count

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.utils.validators import valid_model_ids
from backend.api.models import (
    User,
    AnnotationCampaign,
    Dataset,
    AnnotationSet,
    SpectroConfig,
)


class AnnotationCampaignListSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output list of AnnotationCampaigns augmented data

    This serializer expects to be used on AnnotationCampaigns that have had prefetched data on tasks using the right
    attr_names
    """

    tasks_count = serializers.SerializerMethodField()
    user_tasks_count = serializers.SerializerMethodField()
    complete_tasks_count = serializers.SerializerMethodField()
    user_complete_tasks_count = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        if "user_id" in kwargs:
            self.user_id = kwargs.pop("user_id")
        super().__init__(*args, **kwargs)

    class Meta:
        model = AnnotationCampaign
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "annotation_set_id",
            "tasks_count",
            "user_tasks_count",
            "complete_tasks_count",
            "user_complete_tasks_count",
            "files_count",
            "created_at",
        ]

    @extend_schema_field(serializers.IntegerField)
    def get_tasks_count(self, campaign):
        return campaign.tasks.count()

    @extend_schema_field(serializers.IntegerField)
    def get_user_tasks_count(self, campaign):
        return len(campaign.user_tasks)

    @extend_schema_field(serializers.IntegerField)
    def get_complete_tasks_count(self, campaign):
        return len(campaign.complete_tasks)

    @extend_schema_field(serializers.IntegerField)
    def get_user_complete_tasks_count(self, campaign):
        return len(campaign.user_complete_tasks)

    @extend_schema_field(serializers.IntegerField)
    def get_files_count(self, campaign):
        return campaign.files_count


class AnnotationCampaignRetrieveAuxCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer meant to output AnnotationCampaign basic data used in AnnotationCampaignRetrieveSerializer
    """

    annotation_set_id = serializers.IntegerField()

    class Meta:
        model = AnnotationCampaign
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "annotation_set_id",
            "datasets",
            "created_at",
        ]


class AnnotationCampaignRetrieveAuxTaskSerializer(serializers.Serializer):
    """
    Serializer meant to output AnnotationTask basic data used in AnnotationCampaignRetrieveSerializer
    """

    status = serializers.IntegerField()
    annotator_id = serializers.IntegerField()
    count = serializers.IntegerField()


class AnnotationCampaignRetrieveSerializer(serializers.Serializer):
    """Serializer meant to output AnnotationCampaign data augmented with tasks data"""

    campaign = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()

    @extend_schema_field(AnnotationCampaignRetrieveAuxCampaignSerializer)
    def get_campaign(self, campaign):
        return AnnotationCampaignRetrieveAuxCampaignSerializer(campaign).data

    @extend_schema_field(AnnotationCampaignRetrieveAuxTaskSerializer(many=True))
    def get_tasks(self, campaign):
        return list(
            campaign.tasks.values("status", "annotator_id").annotate(
                count=Count("status")
            )
        )


class AnnotationCampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer meant for AnnotationCampaign creation with corresponding tasks"""

    desc = serializers.CharField(allow_blank=True)
    instructions_url = serializers.CharField(allow_blank=True)
    start = serializers.DateTimeField(required=False)
    end = serializers.DateTimeField(required=False)
    annotation_set_id = serializers.IntegerField(
        validators=[valid_model_ids(AnnotationSet)]
    )
    datasets = serializers.ListField(
        child=serializers.IntegerField(),
        validators=[valid_model_ids(Dataset)],
        allow_empty=False,
    )
    spectros = serializers.ListField(
        child=serializers.IntegerField(),
        validators=[valid_model_ids(SpectroConfig)],
        allow_empty=False,
    )
    annotators = serializers.ListField(
        child=serializers.IntegerField(), validators=[valid_model_ids(User)]
    )
    annotation_method = serializers.IntegerField(min_value=0, max_value=1)
    annotation_goal = serializers.IntegerField(min_value=1)

    class Meta:
        model = AnnotationCampaign
        fields = [
            "id",
            "name",
            "desc",
            "instructions_url",
            "start",
            "end",
            "annotation_set_id",
            "datasets",
            "spectros",
            "annotators",
            "annotation_method",
            "annotation_goal",
            "annotation_scope",
        ]

    def validate(self, attrs):
        """Validates that chosen spectros correspond to chosen datasets"""
        db_spectros = Dataset.objects.filter(id__in=attrs["datasets"]).values_list(
            "spectro_configs", flat=True
        )
        bad_vals = set(attrs["spectros"]) - set(db_spectros)
        if bad_vals:
            raise serializers.ValidationError(
                f"{bad_vals} not valid ids for spectro configs of given datasets"
            )
        return attrs

    def create(self, validated_data):
        campaign = AnnotationCampaign(
            name=validated_data["name"],
            desc=validated_data.get("desc"),
            start=validated_data.get("start"),
            end=validated_data.get("end"),
            annotation_set_id=validated_data["annotation_set_id"],
            annotation_scope=validated_data["annotation_scope"],
            owner_id=validated_data["owner_id"],
            instructions_url=validated_data.get("instructions_url"),
            created_at=datetime.today(),
        )
        campaign.save()
        campaign.datasets.set(validated_data["datasets"])
        campaign.spectro_configs.set(validated_data["spectros"])
        file_count = sum(
            campaign.datasets.annotate(Count("files")).values_list(
                "files__count", flat=True
            )
        )
        total_goal = file_count * int(validated_data["annotation_goal"])
        annotator_goal, remainder = divmod(
            total_goal, len(validated_data["annotators"])
        )
        annotation_method = ["random", "sequential"][
            int(validated_data["annotation_method"])
        ]
        for annotator in User.objects.filter(id__in=validated_data["annotators"]):
            files_target = annotator_goal
            if remainder > 0:
                files_target += 1
                remainder -= 1
            campaign.add_annotator(annotator, files_target, annotation_method)
        return campaign


class AnnotationCampaignAddAnnotatorsSerializer(serializers.Serializer):
    """
    Serializer meant to update AnnotationCampagin with new annotators and corresponding tasks.

    If annotation_goal (the number of files wanted to be annotated) is not given then the whole
    dataset will be targeted.

    The parameter annotation_method is 0 for sequential and 1 for random.
    """

    annotators = serializers.ListField(
        child=serializers.IntegerField(), validators=[valid_model_ids(User)]
    )
    annotation_method = serializers.IntegerField(min_value=0, max_value=1)
    annotation_goal = serializers.IntegerField(min_value=1, required=False)

    def update(self, instance, validated_data):
        files_target = 0
        if "annotation_goal" in validated_data:
            files_target = validated_data["annotation_goal"]
        else:
            files_target = sum(
                instance.datasets.annotate(Count("files")).values_list(
                    "files__count", flat=True
                )
            )
        annotation_method = ["random", "sequential"][
            int(validated_data["annotation_method"])
        ]
        for annotator in User.objects.filter(id__in=validated_data["annotators"]):
            instance.add_annotator(annotator, files_target, annotation_method)
        return instance
