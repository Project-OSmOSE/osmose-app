"""Campaign model"""
from typing import Optional

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import signals
from django.dispatch import receiver
from django.utils import timezone

from backend.aplose.models import User
from .confidence_set import ConfidenceSet
from .label import Label
from .label_set import LabelSet
from ..common import Archive
from ..data import Dataset, SpectrogramAnalysis


class AnnotationCampaign(models.Model):
    """Campaign to make annotation on the designated dataset with the given label set and confidence indicator set"""

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return str(self.name)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    instructions_url = models.URLField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)

    label_set = models.ForeignKey(
        LabelSet, on_delete=models.PROTECT, null=True, blank=True
    )
    labels_with_acoustic_features = models.ManyToManyField(Label, blank=True)
    allow_point_annotation = models.BooleanField(default=False)
    dataset = models.ForeignKey(
        Dataset,
        related_name="annotation_campaigns",
        on_delete=models.PROTECT,
    )
    analysis = models.ManyToManyField(
        SpectrogramAnalysis,
        related_name="annotation_campaigns",
        through="AnnotationCampaignAnalysis",
    )
    allow_image_tuning = models.BooleanField(blank=False, default=False)
    allow_colormap_tuning = models.BooleanField(blank=False, default=False)
    colormap_default = models.TextField(null=True, blank=True)
    colormap_inverted_default = models.BooleanField(blank=True, null=True)

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    confidence_set = models.ForeignKey(
        ConfidenceSet, on_delete=models.SET_NULL, null=True, blank=True
    )
    archive = models.OneToOneField(
        Archive,
        related_name="annotation_campaign",
        on_delete=models.SET_NULL,
        null=True,
    )

    def do_archive(self, user: User):
        """Archive current campaign"""
        if self.archive is not None:
            return
        self.archive = Archive.objects.create(by_user=user)
        self.save()
        for phase in self.phases.all():
            phase.end(user)

    # TODO:
    # def get_sorted_files(self) -> QuerySet[Spectrogram]:
    #     """Return sorted dataset files"""
    #     return Spectrogram.objects.filter(analysis=self.analysis).order_by(
    #         "start", "id"
    #     )


class AnnotationCampaignAnalysis(models.Model):
    class Meta:
        unique_together = ("annotation_campaign", "analysis")

    annotation_campaign = models.ForeignKey(
        AnnotationCampaign, on_delete=models.CASCADE
    )
    analysis = models.ForeignKey(SpectrogramAnalysis, on_delete=models.PROTECT)

    def save(self, **kwargs):
        super().save(**kwargs)

    # TODO: check analysis is from the same dataset as campaign


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
