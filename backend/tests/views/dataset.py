"""Dataset DRF-Viewset test file"""
import unittest

from django.urls import reverse
from django.test import override_settings
from django.conf import settings

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import Dataset


IMPORT_FIXTURES = settings.FIXTURE_DIRS[0] / "list_to_import"


class DatasetViewSetUnauthenticatedTestCase(APITestCase):
    """Test DatasetViewSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """Dataset view 'list' returns 401 if no user is authenticated"""
        url = reverse("dataset-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_datawork_import_unauthenticated(self):
        """Dataset view 'datawork_import' returns 401 if no user is authenticated"""
        url = reverse("dataset-datawork-import")
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
            [
                "id",
                "name",
                "files_type",
                "start_date",
                "end_date",
                "files_count",
                "type",
                "spectros",
                "created_at",
            ],
        )
        self.assertEqual(response.data[0]["name"], "SPM Aural A 2010")
        self.assertEqual(len(response.data[0]["spectros"]), 1)

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "missing_file")
    def test_list_to_import_for_staff_missing_file(self):
        """Dataset view 'list_to_import"' returns 'No such file or directory' when missing file"""
        self.client.login(username="staff", password="osmose29")
        url = reverse("dataset-list-to-import")
        response = self.client.get(url, follow=True)
        self.assertContains(response, "No such file or directory:", status_code=400)

    def test_datawork_import_for_user(self):
        """Dataset view 'datawork_import' is forbidden for non-staff"""
        url = reverse("dataset-datawork-import")
        data_send = {"wanted_datasets": [{"names": "gliderSPAmsDemo (600_400)"}]}
        response = self.client.post(url, data_send, format="json", follow=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "good")
    def test_datawork_import_for_staff_good(self):
        """Dataset view 'datawork_import' imports correctly a single dataset"""
        old_count = Dataset.objects.count()
        self.client.login(username="staff", password="osmose29")
        url = reverse("dataset-datawork-import")
        data_send = {"wanted_datasets": [{"name": "gliderSPAmsDemo (600_400)"}]}
        response = self.client.post(url, data_send, format="json", follow=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Dataset.objects.count(), old_count + 1)
        self.assertEqual(Dataset.objects.latest("id").files.count(), 10)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            list(response.data[0].keys()),
            [
                "id",
                "name",
                "files_type",
                "start_date",
                "end_date",
                "files_count",
                "type",
                "spectros",
                "created_at",
            ],
        )
        self.assertEqual(response.data[0]["name"], "gliderSPAmsDemo (600_400)")
        self.assertEqual(len(response.data[0]["spectros"]), 1)

    # TODO :  : fix
    @unittest.skip("to fix Permission denied")
    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "good")
    def test_datawork_import_for_staff_missing_permissions(self):
        """Dataset view 'datawork_import' returns 'Permission denied' when there is a permission issue"""
        self.client.login(username="staff", password="osmose29")
        url = reverse("dataset-datawork-import")
        data_send = {"wanted_datasets": [{"name": "gliderSPAmsDemo (600_400)"}]}
        response = self.client.post(url, data_send, format="json", follow=True)
        original_permissions = settings.DATASET_IMPORT_FOLDER.stat().st_mode
        settings.DATASET_IMPORT_FOLDER.chmod(0o444)  # removing open-folder permission
        try:
            response = response = self.client.post(
                url, data_send, format="json", follow=True
            )
        finally:
            settings.DATASET_IMPORT_FOLDER.chmod(original_permissions)
        self.assertContains(response, "Permission denied", status_code=400)

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "missing_csv_columns")
    def test_datawork_import_for_staff_mssing_csv_columns(self):
        """Dataset view 'datawork_import' returns a 'CSV column missing' message when import CSV is malformed"""
        self.client.login(username="staff", password="osmose29")
        url = reverse("dataset-datawork-import")
        data_send = {"wanted_datasets": [{"name": "gliderSPAmsDemo (600_400)"}]}
        response = self.client.post(url, data_send, format="json", follow=True)
        self.assertContains(
            response,
            "One of the import CSV is missing the following column : 'dataset_type_name'",
            status_code=400,
        )
