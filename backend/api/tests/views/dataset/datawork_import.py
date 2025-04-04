"""Dataset import tests"""
from django.http import HttpResponse
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend import settings
from backend.api.models import Dataset
from backend.api.serializers.data.dataset import DATASET_FIELDS

IMPORT_FIXTURES = settings.FIXTURE_DIRS[1] / "dataset" / "list_to_import"
URL = reverse("dataset-datawork-import")
DATA_SEND = {"wanted_datasets": [{"name": "gliderSPAmsDemo"}]}


class DatasetViewSetDataworkImportTestcase(APITestCase):
    """Test DatasetViewSet when request is unauthenticated"""

    fixtures = ["users", "datasets"]

    def tearDown(self):
        """Logout when tests ends"""
        self.client.logout()

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "good")
    def test_request_unauthenticated(self):
        """Test unauthenticated request, supposed to be unauthorized"""
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "good")
    def test_datawork_import_for_user(self):
        """Dataset view 'datawork_import' is forbidden for non-staff"""
        self.client.login(username="user1", password="osmose29")
        url = reverse("dataset-datawork-import")
        response = self.client.post(url, DATA_SEND, format="json", follow=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "good")
    def test_datawork_import_for_staff(self):
        """Dataset view 'datawork_import' is allowed for staff"""
        self.basic_import_test()

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "missing_file")
    def test_list_to_import_for_staff_missing_file(self):
        """Dataset view 'list_to_import"' returns 'No such file or directory' when missing file"""
        self.client.login(username="staff", password="osmose29")
        response: HttpResponse = self.client.post(
            URL, DATA_SEND, format="json", follow=True
        )
        self.assertContains(response, "No such file or directory:", status_code=400)

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "missing_csv_columns")
    def test_datawork_import_for_staff_missing_csv_columns(self):
        """Dataset view 'datawork_import' returns a 'CSV column missing' message when import CSV is malformed"""
        self.client.login(username="staff", password="osmose29")
        response: HttpResponse = self.client.post(
            URL, DATA_SEND, format="json", follow=True
        )
        self.assertContains(
            response,
            "One of the import CSV is missing the following column : 'dataset'",
            status_code=400,
        )

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "porp_delph_scale")
    def test_datawork_import_for_staff_porp_delph_scale(self):
        """Check correct import of porp_delph scale"""
        response = self.basic_import_test()
        self.assertEqual(
            response.data[0]["spectros"][0]["multi_linear_frequency_scale"]["name"],
            "porp_delph",
        )
        self.assertEqual(
            len(
                response.data[0]["spectros"][0]["multi_linear_frequency_scale"][
                    "inner_scales"
                ]
            ),
            3,
        )

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "Dual_LF_HF_scale")
    def test_datawork_import_for_staff_dual_lf_hf_scale(self):
        """Check correct import of Dual_LF_HF scale"""
        response = self.basic_import_test()
        self.assertEqual(
            response.data[0]["spectros"][0]["multi_linear_frequency_scale"]["name"],
            "dual_lf_hf",
        )
        self.assertEqual(
            len(
                response.data[0]["spectros"][0]["multi_linear_frequency_scale"][
                    "inner_scales"
                ]
            ),
            2,
        )

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "Audible_scale")
    def test_datawork_import_for_staff_audible_scale(self):
        """Check correct import of Audible scale"""
        response = self.basic_import_test()
        self.assertEqual(
            response.data[0]["spectros"][0]["linear_frequency_scale"]["name"],
            "audible",
        )

    @override_settings(DATASET_IMPORT_FOLDER=IMPORT_FIXTURES / "path")
    def test_datawork_import_for_staff_path(self):
        """Check correct import of Audible scale"""
        self.basic_import_test()

    def basic_import_test(self) -> HttpResponse:
        """Basic test for dataset import for authorized user"""
        old_count = Dataset.objects.count()
        self.client.login(username="staff", password="osmose29")
        response: HttpResponse = self.client.post(
            URL, DATA_SEND, format="json", follow=True
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Dataset.objects.count(), old_count + 1)
        self.assertEqual(Dataset.objects.latest("id").files.count(), 10)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(list(response.data[0].keys()), DATASET_FIELDS)
        self.assertEqual(response.data[0]["name"], "gliderSPAmsDemo")
        self.assertEqual(len(response.data[0]["spectros"]), 1)
        return response
