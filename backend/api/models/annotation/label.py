"""Label model"""

from django.db import models
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
        MetadataxLabel, on_delete=models.SET_NULL, null=True, blank=True
    )
