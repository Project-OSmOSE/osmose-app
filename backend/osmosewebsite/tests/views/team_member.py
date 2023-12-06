"""User DRF-Viewset test file"""

from django.urls import reverse
from backend.osmosewebsite.models import TeamMember

from rest_framework import status
from rest_framework.test import APITestCase


class TeamMemberViewSetTestCase(APITestCase):
    """Test TeamMemberViewSetTestCase when list or detail news are request"""

    fixtures = ["team_member"]
    creation_data = {
        "id": 1,
        "name": "string",
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
        self.assertEqual(
            list(response.data[0].keys()),
            [
                "id",
                "name",
                "position",
                "biography",
                "picture",
                "mail_address",
                "research_gate_url",
                "personal_website_url",
                "github_url",
                "linkedin_url",
                "is_former_member",
            ],
        )
        self.assertEqual(response.data[0]["name"], "user2")
        self.assertEqual(response.data[0]["position"], "job2")
        self.assertEqual(response.data[0]["is_former_member"], False)

    def test_retrieve(self):
        """TeamMemberViewSet 'retrieve' returns team members details"""
        url = reverse("members-detail", kwargs={"pk": 3})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data),
            [
                "id",
                "name",
                "position",
                "biography",
                "picture",
                "mail_address",
                "research_gate_url",
                "personal_website_url",
                "github_url",
                "linkedin_url",
                "is_former_member",
            ],
        )
        self.assertEqual(response.data["name"], "user3")
        self.assertEqual(response.data["position"], "job3")
        self.assertEqual(response.data["is_former_member"], True)
