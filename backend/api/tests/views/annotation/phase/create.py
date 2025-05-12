"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationCampaignPhase
from backend.utils.tests import AuthenticatedTestCase, all_fixtures

URL = reverse("annotation-campaign-phase-list")

creation_data = {"phase": "Verification", "annotation_campaign": 1}


class CreateUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_create(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(URL, creation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@freeze_time("2012-01-14 00:00:00")
class CreateAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test_create_if_phase_exists_fails(self):
        old_count = AnnotationCampaignPhase.objects.count()
        response = self.client.post(
            URL, {"phase": "Annotation", "annotation_campaign": 1}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("non_field_errors")[0].code, "unique")
        self.assertEqual(AnnotationCampaignPhase.objects.count(), old_count)

    def test_create(self):
        old_count = AnnotationCampaignPhase.objects.count()
        response = self.client.post(URL, creation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationCampaignPhase.objects.count(), old_count + 1)
        phase = AnnotationCampaignPhase.objects.latest("id")

        self.assertEqual(response.data["id"], phase.id)
        self.assertEqual(response.data["phase"], "Verification")
        self.assertEqual(response.data["created_by"], self.username)
        self.assertEqual(response.data["created_at"], "2012-01-14T00:00:00Z")
        self.assertEqual(response.data["global_progress"], 0)
        self.assertEqual(response.data["global_total"], 0)
        self.assertEqual(response.data["user_progress"], 0)
        self.assertEqual(response.data["user_total"], 0)
        self.assertTrue(response.data["has_annotations"])


@freeze_time("2012-01-14 00:00:00")
class CreateCampaignOwnerAuthenticatedTestCase(CreateAdminAuthenticatedTestCase):
    username = "user1"


class CreateBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = all_fixtures

    def test_create(self):
        response = self.client.post(URL, creation_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
