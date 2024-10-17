"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationCampaign,
    LabelSet,
    ConfidenceIndicatorSet,
    AnnotationComment,
)
from backend.api.tests.utils import AuthenticatedTestCase, all_fixtures

URL = reverse("annotation-campaign-list")

creation_data = {
    "name": "string",
    "desc": "string",
    "instructions_url": "string",
    "deadline": "2022-01-30T10:42:15Z",
    "label_set": 1,
    "confidence_indicator_set": 1,
    "datasets": ["SPM Aural A 2010"],
    "spectro_configs": [1],
    "created_at": "2012-01-14T00:00:00Z",
    "usage": "Create",
}
check_creation_data = {
    "name": "string",
    "desc": "string",
    "instructions_url": "string",
    "deadline": "2022-01-30T10:42:15Z",
    "datasets": ["SPM Aural A 2010"],
    "spectro_configs": [1],
    "created_at": "2012-01-14T00:00:00Z",
    "usage": "Check",
    "label_set_labels": ["click"],
    "confidence_set_indicators": [
        {"level": 0, "label": "not sure"},
        {"level": 1, "label": "sure"},
    ],
    "detectors": [{"detectorName": "nninni", "configuration": "test"}],
}


class CreateUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_create_create_usage(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(URL, creation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_check_usage(self):
        """AnnotationCampaign view 'create' adds new campaign to DB and returns campaign info"""
        response = self.client.post(URL, check_creation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@freeze_time("2012-01-14 00:00:00", tz_offset=-4)
class CreateAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test_create_create_usage(self):
        old_count = AnnotationCampaign.objects.count()
        response = self.client.post(URL, creation_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)
        campaign = AnnotationCampaign.objects.latest("id")

        self.assertEqual(response.data["id"], campaign.id)
        self.assertEqual(response.data["confidence_indicator_set"], 1)
        self.assertEqual(response.data["label_set"], 1)
        self.assertEqual(response.data["usage"], "Create")
        self.assertEqual(
            response.data["annotation_scope"], AnnotationCampaign.AnnotationScope.WHOLE
        )
        self.assertEqual(response.data["datasets"], ["SPM Aural A 2010"])
        self.assertEqual(response.data["archive"], None)
        self.assertEqual(
            list(campaign.spectro_configs.values_list("id", flat=True)), [1]
        )

    def test_double_create_create_usage(self):
        old_count = AnnotationCampaign.objects.count()
        response_1 = self.client.post(URL, creation_data, format="json")
        self.assertEqual(response_1.status_code, status.HTTP_201_CREATED)

        response_2 = self.client.post(URL, creation_data, format="json")
        self.assertEqual(response_2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response_2.data.get("name")[0].code, "unique")

        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)

    def test_create_check_usage(self):
        """AnnotationCampaign view 'create' adds new campaign to DB and returns campaign info"""
        old_count = AnnotationCampaign.objects.count()
        response = self.client.post(URL, check_creation_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)
        campaign = AnnotationCampaign.objects.latest("id")

        self.assertEqual(response.data["id"], campaign.id)
        self.assertEqual(response.data["usage"], "Check")
        self.assertEqual(
            response.data["annotation_scope"], AnnotationCampaign.AnnotationScope.WHOLE
        )

        label_set = LabelSet.objects.latest("id")
        self.assertEqual(response.data["label_set"], label_set.id)
        self.assertEqual(label_set.labels.count(), 1)

        confidence_set = ConfidenceIndicatorSet.objects.latest("id")
        self.assertEqual(response.data["confidence_indicator_set"], confidence_set.id)
        self.assertEqual(confidence_set.confidence_indicators.count(), 2)
        self.assertEqual(confidence_set.max_level, 1)


@freeze_time("2012-01-14 00:00:00", tz_offset=-4)
class CreateBaseUserAuthenticatedTestCase(CreateAdminAuthenticatedTestCase):
    username = "user1"
