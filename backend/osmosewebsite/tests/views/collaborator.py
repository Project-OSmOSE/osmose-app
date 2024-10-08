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
        self.assertEqual(response.data[0]["name"], "collaborator2")
        self.assertEqual(response.data[0]["show_on_home_page"], False)

    def test_on_home(self):
        """CollaboratorViewSet 'list' returns the list of Collaborator to show on home page"""
        url = reverse("collaborators-on-home")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(list(response.data[0].keys()), CollaboratorFields)
        self.assertEqual(response.data[0]["show_on_home_page"], True)
        self.assertEqual(response.data[1]["show_on_home_page"], True)

    def test_on_aplose_home(self):
        """CollaboratorViewSet 'list' returns the list of Collaborator to show on home page"""
        url = reverse("collaborators-on-aplose-home")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(list(response.data[0].keys()), CollaboratorFields)
        self.assertEqual(response.data[0]["show_on_aplose_home"], True)
        self.assertEqual(response.data[1]["show_on_aplose_home"], True)

    def test_retrieve(self):
        """CollaboratorViewSet 'retrieve' returns Collaborator details"""
        url = reverse("collaborators-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data), CollaboratorFields)
        self.assertEqual(response.data["name"], "collaborator1")
        self.assertEqual(response.data["show_on_home_page"], True)
