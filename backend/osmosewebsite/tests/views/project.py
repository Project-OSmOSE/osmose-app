"""Project DRF-Viewset test file"""

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from backend.osmosewebsite.serializers.project import ProjectFields


class ProjectViewSetTestCase(APITestCase):
    """Test ProjectViewSetTestCase when list or detail Project are request"""

    fixtures = ["project"]

    def test_list(self):
        """ProjectViewSet 'list' returns list of Project"""
        url = reverse("projects-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(list(response.data[0].keys()), ProjectFields)
        self.assertEqual(response.data[0]["title"], "title1")
        self.assertEqual(response.data[0]["body"], "body1")

    def test_retrieve(self):
        """ProjectViewSet 'retrieve' returns Project details"""
        url = reverse("Project-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data), ProjectFields)
        self.assertEqual(response.data["title"], "title1")
        self.assertEqual(response.data["body"], "body1")
