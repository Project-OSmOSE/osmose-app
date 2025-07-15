"""Campaign model"""
from django.conf import settings
from django.db import models
from django.utils import timezone

from .confidence_set import ConfidenceSet
from .label import Label
from .label_set import LabelSet
from ..common import Archive
from ..data import Dataset, SpectrogramAnalysis


class AnnotationCampaign(models.Model):
    """Campaign to make annotation on the designated dataset with the given label set and confidence indicator set"""

    AnnotationScope = models.IntegerChoices("AnnotationScope", "RECTANGLE WHOLE")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return str(self.name)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    instructions_url = models.TextField(null=True, blank=True)
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

    # TODO:
    # def do_archive(self, user: User):
    #     """Archive current campaign"""
    #     if self.archive is not None:
    #         return
    #     self.archive = Archive.objects.create(by_user=user)
    #     self.save()
    #     for phase in self.phases.all():
    #         phase.end(user)

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

    # TODO: check analysis is from the same dataset as campaign
