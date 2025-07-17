"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring, duplicate-code
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.utils.tests import AuthenticatedTestCase, all_fixtures, empty_fixtures

URL = reverse("annotation-campaign-phase-list")


class ListUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    fixtures = all_fixtures

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ListEmpyAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = empty_fixtures

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class ListFilledAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
        self.assertEqual(response.data[0]["annotation_campaign"], 1)
        self.assertEqual(response.data[1]["annotation_campaign"], 2)
        self.assertEqual(response.data[2]["annotation_campaign"], 3)
        self.assertEqual(response.data[2]["user_total"], 0)


class ListFilledCampaignOwnerAuthenticatedTestCase(
    ListFilledAdminAuthenticatedTestCase
):
    username = "user1"
    fixtures = all_fixtures


class ListFilledBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = all_fixtures

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(response.data[0]["annotation_campaign"], 1)
        self.assertEqual(response.data[1]["annotation_campaign"], 2)
        self.assertEqual(response.data[2]["annotation_campaign"], 4)
        self.assertEqual(response.data[0]["user_total"], 4)


class ListFilledBaseUserNoCampaignAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user4"
    fixtures = all_fixtures

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
