"""Util test case classes with common behavior"""
from rest_framework.test import APITestCase


all_fixtures = [
    "users",
    "datasets",
    "label_sets",
    "confidence_indicator_sets",
    "annotation_campaigns_tasks",
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
