"""Campaign related models"""
from typing import Optional

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import QuerySet, signals
from django.dispatch import receiver
from django.utils import timezone

from backend.aplose.models import User
from .confidence import ConfidenceIndicatorSet
from .label import LabelSet, Label
from ..datasets import DatasetFile


class AnnotationCampaignUsage(models.IntegerChoices):
    """Annotation campaign usage"""

    CREATE = (
        0,
        "Create",
    )
    CHECK = (
        1,
        "Check",
    )


class AnnotationCampaignArchive(models.Model):
    """AnnotationCampaign archive information"""

    date = models.DateTimeField(auto_now_add=True)
    by_user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        related_name="archived_campaigns",
        on_delete=models.SET_NULL,
        null=True,
    )

    def __str__(self):
        return str(self.date) + " | " + str(self.by_user)


class AnnotationCampaign(models.Model):
    """
    Table containing an annotation_campaign, to be used with the table annotation_campaign_datasets. A researcher
    wanting to have a number of annotated datasets will choose an label_set and launch a campaign.

    For AnnotationScope RECTANGLE means annotating through boxes first, WHOLE means annotating presence/absence for the
    whole file first (boxes can be used to augment annotation).
    """

    AnnotationScope = models.IntegerChoices("AnnotationScope", "RECTANGLE WHOLE")

    class Meta:
        db_table = "annotation_campaigns"
        ordering = ["name"]

    def __str__(self):
        return str(self.name)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    instructions_url = models.TextField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)

    label_set = models.ForeignKey(LabelSet, on_delete=models.CASCADE)
    labels_with_acoustic_features = models.ManyToManyField(Label, blank=True)
    allow_point_annotation = models.BooleanField(default=False)
    datasets = models.ManyToManyField("Dataset", related_name="annotation_campaigns")
    spectro_configs = models.ManyToManyField(
        "SpectrogramConfiguration", related_name="annotation_campaigns"
    )
    allow_image_tuning = models.BooleanField(blank=False, default=False)
    allow_colormap_tuning = models.BooleanField(blank=False, default=False)
    colormap_default = models.TextField(null=True, blank=True)
    colormap_inverted_default = models.BooleanField(blank=True, null=True)
    annotation_scope = models.IntegerField(
        choices=AnnotationScope.choices, default=AnnotationScope.WHOLE
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    confidence_indicator_set = models.ForeignKey(
        ConfidenceIndicatorSet, on_delete=models.SET_NULL, null=True, blank=True
    )
    archive = models.OneToOneField(
        AnnotationCampaignArchive,
        related_name="campaign",
        on_delete=models.SET_NULL,
        null=True,
    )

    def do_archive(self, user: User):
        """Archive current campaign"""
        if self.archive is not None:
            return
        self.archive = AnnotationCampaignArchive.objects.create(by_user=user)
        self.save()

    def get_sorted_files(self) -> QuerySet[DatasetFile]:
        """Return sorted dataset files"""
        return DatasetFile.objects.filter(
            dataset_id__in=self.datasets.values_list("id", flat=True)
        ).order_by("start", "id")


class AnnotationCampaignPhase(models.Model):
    """Annotation campaign phase"""

    class Phase(models.TextChoices):
        """Available phases of the annotation campaign"""

        ANNOTATION = "A", "Annotation"
        VERIFICATION = "V", "Verification"

    class Meta:
        unique_together = (("phase", "annotation_campaign"),)

    def __str__(self):
        return f"{self.annotation_campaign} - {AnnotationCampaignPhase.Phase(self.phase).label}"

    phase = models.CharField(choices=Phase.choices, max_length=1)
    annotation_campaign = models.ForeignKey(
        AnnotationCampaign,
        on_delete=models.CASCADE,
        related_name="phases",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_phases",
    )

    ended_at = models.DateTimeField(blank=True, null=True)
    ended_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ended_phases",
        blank=True,
        null=True,
    )

    @property
    def is_open(self) -> bool:
        """Get open state of the phase"""
        if not self.ended_at or not self.ended_by:
            return True

    def end(self, user: User):
        """End the phase"""
        self.ended_at = timezone.now()
        self.ended_by = user
        self.save()


@receiver(
    signal=signals.m2m_changed,
    sender=AnnotationCampaign.labels_with_acoustic_features.through,
)
def check_labels_features_in_label_set(sender, **kwargs):
    """Check added labels in labels_with_acoustic_features does belong to the campaign label_set"""
    # pylint: disable=unused-argument
    action = kwargs.pop("action", None)
    if action != "pre_add":
        return
    campaign: Optional[AnnotationCampaign] = kwargs.pop("instance", None)
    if not campaign:
        return
    pk_set = kwargs.pop("pk_set", {})
    for pk in pk_set:
        label = Label.objects.get(pk=pk)
        if not label:
            continue
        if label not in campaign.label_set.labels.all():
            raise ValidationError(
                {
                    "labels_with_acoustic_features": "Label with acoustic features should belong to label set"
                },
                code="invalid",
            )
