"""Dataset DRF-Viewset test file"""

from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import Dataset
from backend.api.serializers.dataset import DATASET_FIELDS

IMPORT_FIXTURES = settings.FIXTURE_DIRS[0] / "list_to_import"


class DatasetViewSetUnauthenticatedTestCase(APITestCase):
    """Test DatasetViewSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """Dataset view 'list' returns 401 if no user is authenticated"""
        url = reverse("dataset-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DatasetViewSetTestCase(APITestCase):
    """Test DatasetViewSet when request is authenticated"""

    fixtures = ["users", "datasets"]

    def setUp(self):
        self.client.login(username="user1", password="osmose29")

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        """Dataset view 'list' returns correct list of datasets"""
        url = reverse("dataset-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), Dataset.objects.count())
        self.assertEqual(
            list(response.data[0].keys()),
            DATASET_FIELDS,
        )
        self.assertEqual(response.data[0]["name"], "Another Dataset")
        self.assertEqual(len(response.data[0]["spectros"]), 1)
