"""Collaborator DRF-Viewset test file"""

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from backend.osmosewebsite.serializers.collaborator import CollaboratorFields


class CollaboratorViewSetTestCase(APITestCase):
    """Test CollaboratorViewSetTestCase when list or detail Collaborator are request"""

    fixtures = ["collaborator"]

    def test_list(self):
        """CollaboratorViewSet 'list' returns list of Collaborator"""
        url = reverse("collaborators-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(list(response.data[0].keys()), CollaboratorFields)
        self.assertEqual(response.data[0]["name"], "name2")
        self.assertEqual(response.data[0]["show_on_home_page"], False)

    def test_retrieve(self):
        """CollaboratorViewSet 'retrieve' returns Collaborator details"""
        url = reverse("Collaborator-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data), CollaboratorFields)
        self.assertEqual(response.data["name"], "name1")
        self.assertEqual(response.data["show_on_home_page"], True)
