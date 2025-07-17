# pylint: disable=missing-module-docstring, missing-class-docstring, missing-function-docstring
from django.core.exceptions import ValidationError
from django.test import TestCase

from backend.api.models import AnnotationCampaign, LabelSet, Dataset
from backend.aplose.models import User


class AnnotationCampaignModelTestCase(TestCase):
    def test_cannot_set_features_labels_outside_label_set(self):
        user = User.objects.create(username="Test")
        campaign = AnnotationCampaign.objects.create(
            name="Test",
            dataset=Dataset.objects.create(
                name="Test",
                owner=user,
            ),
            label_set=LabelSet.objects.create(name="Test"),
            owner=user,
        )

        self.assertRaises(
            ValidationError,
            lambda: campaign.labels_with_acoustic_features.create(name="Test"),
        )
