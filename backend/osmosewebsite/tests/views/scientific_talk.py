"""ScientificTalk tests"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from backend.osmosewebsite.serializers.scientific_talk import ScientificTalkFields


class ScientificTalkViewSetTestCase(APITestCase):
    """Test ScientificTalk when list or detail trap are request"""

    fixtures = ["users", "scientific_talk"]
    creation_data = {
        "presenter_name": "string",
        "title": "ScientificTalk",
        "intro": "string",
        "date": "2022-01-25T10:42:15Z",
        "thumbnail": "string",
    }

    def test_list(self):
        """ScientificTalkViewSet 'list' returns list of ScientificTalk"""
        url = reverse("scientific-talk-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(list(response.data[0].keys()), ScientificTalkFields)
        self.assertEqual(response.data[0]["presenter_name"], "user1")
        self.assertEqual(response.data[1]["presenter_name"], "user2")
        self.assertEqual(
            response.data[1]["title"], "ECS 2023 Presentation et retour de conference"
        )

    def test_retrieve(self):
        """ScientificTalkViewSet 'retrieve' returns ScientificTalk details"""
        url = reverse("scientific-talk-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), ScientificTalkFields)
        self.assertEqual(response.data["presenter_name"], "user1")
        self.assertEqual(
            response.data["title"],
            "Assessing marine mammal diversity in remote Indian Ocean regions, using an acoustic glider",
        )
        self.assertEqual(
            response.data["intro"],
            "Her order another who company step office. Garden space various suddenly. "
            "Character large standard attention. Pass time special according role carry base.",
        )
