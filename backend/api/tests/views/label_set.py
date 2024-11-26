"""LabelSet DRF-Viewset test file"""

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import LabelSet


class LabelSetViewSetUnauthenticatedTestCase(APITestCase):
    """Test LabelSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """LabelSet view 'list' returns 401 if no user is authenticated"""
        url = reverse("label-set-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LabelSetViewSetTestCase(APITestCase):
    """Test LabelSet when request is authenticated"""

    fixtures = ["users", "label_sets"]

    def setUp(self):
        self.client.login(username="user1", password="osmose29")

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        """LabelSet view 'list' returns correct list of label  sets"""
        url = reverse("label-set-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), LabelSet.objects.count())
        self.assertEqual(
            list(response.data[1].keys()), ["id", "name", "desc", "labels"]
        )
        self.assertEqual(response.data[1]["name"], "Test SPM campaign")
        self.assertEqual(
            response.data[1]["labels"],
            ["Mysticetes", "Odoncetes", "Boat", "Rain", "Other"],
        )
