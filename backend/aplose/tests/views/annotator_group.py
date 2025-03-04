"""User DRF-Viewset test file"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AnnotatorGroupViewSetUnauthenticatedTestCase(APITestCase):
    """Test AnnotatorGroupViewSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """AnnotatorGroup view 'list' returns 401 if no user is authenticated"""
        url = reverse("annotator-group-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_self_unauthenticated(self):
        """AnnotatorGroup view 'is_staff' returns 401 if no user is authenticated"""
        url = reverse("annotator-group-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AnnotatorGroupViewSetTestCase(APITestCase):
    """Test AnnotatorGroupViewSet when request is authenticated"""

    fixtures = ["users"]

    def setUp(self):
        self.client.login(username="user1", password="osmose29")

    def tearDown(self):
        self.client.logout()

    def __check_group(self, data):
        self.assertEqual(data["name"], "Annotators group")
        self.assertEqual(len(data["annotators"]), 4)

    def test_list(self):
        """AnnotatorGroup view 'list' returns correct list of AnnotatorGroup"""
        url = reverse("annotator-group-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.__check_group(response.data[0])

    def test_detail(self):
        """AnnotatorGroup view 'detail'"""
        url = reverse("annotator-group-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.__check_group(response.data)
