"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.tests.utils import AuthenticatedTestCase, empty_fixtures, all_fixtures

URL = reverse("annotation-campaign-detail", kwargs={"pk": 1})


class RetrieveUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RetrieveEmpyAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = empty_fixtures

    def test_unknown(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RetrieveFilledAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test_retrieve(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], 1)
        self.assertEqual(response.data["name"], "Test SPM campaign")
        self.assertEqual(len(response.data["datasets"]), 1)
        self.assertEqual(response.data["owner"], 3)
        self.assertEqual(response.data["my_progress"], 0)
        self.assertEqual(response.data["my_total"], 6)


class RetrieveFilledCampaignOwnerAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user1"
    fixtures = all_fixtures

    def test_retrieve(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], 1)
        self.assertEqual(response.data["name"], "Test SPM campaign")
        self.assertEqual(len(response.data["datasets"]), 1)
        self.assertEqual(response.data["owner"], 3)
        self.assertEqual(response.data["my_progress"], 0)
        self.assertEqual(response.data["my_total"], 0)


class RetrieveFilledBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = all_fixtures

    def test_retrieve(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], 1)
        self.assertEqual(response.data["name"], "Test SPM campaign")
        self.assertEqual(len(response.data["datasets"]), 1)
        self.assertEqual(response.data["owner"], 3)
        self.assertEqual(response.data["my_progress"], 0)
        self.assertEqual(response.data["my_total"], 5)


class RetrieveFilledBaseUserNoCampaignAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user4"
    fixtures = all_fixtures

    def test_retrieve(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
