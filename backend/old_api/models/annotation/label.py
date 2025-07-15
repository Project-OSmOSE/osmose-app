"""Label related models"""
from django.db import models
from django.db.models import QuerySet
from metadatax.ontology.models import Label as MetadataxLabel


class Label(models.Model):
    """
    This table contains labels which are used to constitute label_set and serve to annotate files for annotation
    campaigns.
    """

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)

    metadatax_label = models.ForeignKey(
        MetadataxLabel, on_delete=models.PROTECT, null=True, blank=True
    )


class LabelSet(models.Model):
    """
    This table contains collections of labels to be used for dataset annotations.
    An label_set is created by a staff user
    and can be used for multiple datasets and annotation campaigns.
    """

    def __str__(self):
        return str(self.name)

    name = models.CharField(max_length=255, unique=True)
    desc = models.TextField(null=True, blank=True)
    labels = models.ManyToManyField(Label)

    @staticmethod
    def create_for_campaign(
        campaign: "AnnotationCampaign",
        labels: QuerySet[Label] = Label.objects.none(),
        index: int = 0,
    ):
        """Recover new label set based on the campaign name"""
        real_name = campaign.name if index == 0 else f"{campaign.name} ({index})"
        if LabelSet.objects.filter(name=real_name).exists():
            return LabelSet.create_for_campaign(campaign, labels, index + 1)
        label_set = LabelSet.objects.create(name=real_name)
        for label in labels.all():
            label_set.labels.add(label)
        return label_set
