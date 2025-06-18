"""User DRF-Viewset test file"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TeamMemberViewSetTestCase(APITestCase):
    """Test TeamMemberViewSetTestCase when list or detail news are request"""

    fixtures = ["team_member"]
    creation_data = {
        "id": 1,
        "lastname": "string",
        "firstname": "string",
        "position": "string",
        "level": 10,
        "biography": "string",
        "picture": "string",
        "mail_address": "string",
        "research_gate_url": "string",
        "personal_website_url": "string",
        "github_url": "string",
        "linkedin_url": "string",
        "is_former_member": False,
    }

    def test_list(self):
        """TeamMemberViewSet 'list' returns list of team members"""
        url = reverse("members-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(response.data[0]["scientist"]["first_name"], "user2")
        self.assertEqual(response.data[0]["position"], "job2")
        self.assertEqual(response.data[0]["is_former_member"], False)

    def test_retrieve(self):
        """TeamMemberViewSet 'retrieve' returns team members details"""
        url = reverse("members-detail", kwargs={"pk": 3})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["scientist"]["first_name"], "user3")
        self.assertEqual(response.data["position"], "job3")
        self.assertEqual(response.data["is_former_member"], True)
