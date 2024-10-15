"""Util test case classes with common behavior"""
from rest_framework.test import APITestCase


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
