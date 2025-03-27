"""Util test case classes with common behavior"""

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.response import Response
from rest_framework.test import APITestCase

all_fixtures = [
    "users",
    "datasets",
    "label_sets",
    "confidence_indicator_sets",
    "annotation_campaigns_tasks",
    "detectors",
    "annotation_results_sessions",
]
empty_fixtures = [
    "users",
]


class AuthenticatedTestCase(APITestCase):
    """Test ViewSet with connected user"""

    username = ""
    password = "osmose29"

    def setUp(self):
        """Login when tests starts"""
        self.client.login(username=self.username, password=self.password)

    def tearDown(self):
        """Logout when tests ends"""
        self.client.logout()


def upload_csv_file_as_string(self: APITestCase, url: str, path: str) -> Response:
    """Upload a CSV file to the given URL"""
    with open(path, "rb") as data:
        data = data.read().decode("utf-8")
        return self.client.post(url, {"data": data})


def upload_csv_file(self: APITestCase, url: str, path: str) -> Response:
    """Upload a CSV file to the given URL"""
    with open(path, "rb") as data:
        data = SimpleUploadedFile(
            content=data.read(), name=data.name, content_type="multipart/form-data"
        )

        return self.client.post(
            url,
            {"file": data},
            format="multipart",
        )
