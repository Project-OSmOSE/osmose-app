"""Test AnnotationFileRangeViewSet"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationFileRange
from backend.api.tests.utils import AuthenticatedTestCase

URL = reverse("annotation-file-range-list")


def create_one_range():
    AnnotationFileRange.objects.create(
        first_file_index=2,
        last_file_index=7,
        annotator_id=1,
        annotation_campaign_id=1,
    )


class ListUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ListEmpyAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = [
        "users",
    ]

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_for_current_user(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_for_current_user_with_files(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
                "with_files": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class ListFilledAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
    ]

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_list_for_current_user(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_for_current_user_with_files(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
                "with_files": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # First file range
        self.assertEqual(response.data[0]["id"], 1)
        self.assertEqual(response.data[0]["files_count"], 6)
        self.assertEqual(len(response.data[0]["files"]), 6)

        # First file of first file range
        self.assertEqual(response.data[0]["files"][0]["id"], 1)
        self.assertEqual(response.data[0]["files"][0]["filename"], "sound001.wav")


class ListFilledCampaignOwnerAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user1"
    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
    ]

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_list_for_current_user(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_for_current_user_with_files(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
                "with_files": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class ListFilledBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
    ]

    def test_list(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_for_current_user(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_for_current_user_with_files(self):
        response = self.client.get(
            URL,
            {
                "for_current_user": True,
                "with_files": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # First file range
        self.assertEqual(response.data[0]["id"], 4)
        self.assertEqual(response.data[0]["files_count"], 1)
        self.assertEqual(len(response.data[0]["files"]), 1)

        # First file of first file range
        self.assertEqual(response.data[0]["files"][0]["id"], 4)
        self.assertEqual(response.data[0]["files"][0]["filename"], "sound004.wav")
