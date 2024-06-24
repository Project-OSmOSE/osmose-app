"""User DRF-Viewset test file"""

from django.urls import reverse
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase


class UserViewSetUnauthenticatedTestCase(APITestCase):
    """Test UserViewSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """User view 'list' returns 401 if no user is authenticated"""
        url = reverse("user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_is_staff_unauthenticated(self):
        """User view 'is_staff' returns 401 if no user is authenticated"""
        url = reverse("user-is-staff")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_unauthenticated(self):
        """User view 'create' returns 401 if no user is authenticated"""
        url = reverse("user-list")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserViewSetTestCase(APITestCase):
    """Test UserViewSet when request is authenticated"""

    fixtures = ["users"]
    creation_data = {
        "username": "new_user",
        "email": "user@example.com",
        "password": "string",
    }

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
                "first_name": "",
                "last_name": "",
            },
        )

    def test_is_staff_for_user(self):
        """User view 'is_staff' returns false for user"""
        url = reverse("user-is-staff")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(dict(response.data), {"is_staff": False})

    def test_is_staff_for_staff(self):
        """User view 'is_staff' returns true for staff"""
        self.client.login(username="staff", password="osmose29")
        url = reverse("user-is-staff")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(dict(response.data), {"is_staff": True})

    def test_create_for_user(self):
        """User view 'create' is forbidden for non-staff"""
        url = reverse("user-list")
        response = self.client.post(url, self.creation_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_for_staff(self):
        """User view 'create' for staff creates new user"""
        old_count = User.objects.count()
        self.client.login(username="staff", password="osmose29")
        url = reverse("user-list")
        response = self.client.post(url, self.creation_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), old_count + 1)
        self.assertEqual(User.objects.last().username, "new_user")
        self.assertEqual(
            dict(response.data),
            {
                "id": 6,
                "username": "new_user",
                "email": "user@example.com",
                "first_name": "",
                "last_name": "",
            },
        )
