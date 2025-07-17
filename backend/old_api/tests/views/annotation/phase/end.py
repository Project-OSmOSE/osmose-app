"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APITestCase

from backend.utils.tests import AuthenticatedTestCase, all_fixtures

URL = reverse("annotation-campaign-phase-end", kwargs={"pk": 1})


class EndUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@freeze_time("2012-01-14 00:00:00")
class EndAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test(self):
        response = self.client.post(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ended_by"], self.username)
        self.assertEqual(response.data["ended_at"], "2012-01-14T00:00:00Z")


@freeze_time("2012-01-14 00:00:00")
class EndCampaignOwnerAuthenticatedTestCase(EndAdminAuthenticatedTestCase):
    username = "user1"


class EndBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = all_fixtures

    def test(self):
        response = self.client.post(URL)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
