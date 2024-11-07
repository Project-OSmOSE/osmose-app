"""User DRF-Viewset test file"""

from django.urls import reverse


from rest_framework import status
from rest_framework.test import APITestCase

from backend.aplose.models import User


class UserViewSetUnauthenticatedTestCase(APITestCase):
    """Test UserViewSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """User view 'list' returns 401 if no user is authenticated"""
        url = reverse("user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_self_unauthenticated(self):
        """User view 'is_staff' returns 401 if no user is authenticated"""
        url = reverse("user-self")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserViewSetTestCase(APITestCase):
    """Test UserViewSet when request is authenticated"""

    fixtures = ["users"]

    def setUp(self):
        self.client.login(username="user1", password="osmose29")

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        """User view 'list' returns correct list of users"""
        url = reverse("user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), User.objects.count())
        self.assertEqual(
            dict(response.data[0]),
            {
                "id": 1,
                "username": "admin",
                "email": "admin@osmose.xyz",
                "expertise_level": "Expert",
                "first_name": "",
                "last_name": "",
                "is_staff": True,
                "is_superuser": True,
            },
        )

    def test_self_for_user(self):
        """User view 'self' returns false for user"""
        url = reverse("user-self")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], 3)
        self.assertEqual(response.data["username"], "user1")
        self.assertEqual(response.data["email"], "user1@osmose.xyz")
        self.assertEqual(response.data["expertise_level"], None)
        self.assertEqual(response.data["is_staff"], False)
        self.assertEqual(response.data["is_superuser"], False)

    def test_self_for_staff(self):
        """User view 'self' returns true for staff"""
        self.client.login(username="staff", password="osmose29")
        url = reverse("user-self")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], 2)
        self.assertEqual(response.data["username"], "staff")
        self.assertEqual(response.data["email"], "staff@osmose.xyz")
        self.assertEqual(response.data["expertise_level"], None)
        self.assertEqual(response.data["is_staff"], True)
        self.assertEqual(response.data["is_superuser"], False)

    def test_self_for_admin(self):
        """User view 'self' returns true for staff"""
        self.client.login(username="admin", password="osmose29")
        url = reverse("user-self")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], 1)
        self.assertEqual(response.data["username"], "admin")
        self.assertEqual(response.data["email"], "admin@osmose.xyz")
        self.assertEqual(response.data["expertise_level"], "Expert")
        self.assertEqual(response.data["is_staff"], True)
        self.assertEqual(response.data["is_superuser"], True)
