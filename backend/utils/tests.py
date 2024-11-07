"""Util test case classes with common behavior"""
import os

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


def upload_csv_file(self: APITestCase, url: str, path: str) -> Response:
    data = open(path, "rb")

    data = SimpleUploadedFile(
        content=data.read(), name=data.name, content_type="multipart/form-data"
    )

    return self.client.post(
        url,
        {"file": data},
        format="multipart",
    )
