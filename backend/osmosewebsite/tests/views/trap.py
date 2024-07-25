from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from backend.osmosewebsite.serializers.trap import TrapFields


class TrapViewSetTestCase(APITestCase):
    """Test TrapViewSetTestCase when list or detail trap are request"""

    fixtures = ["users", "trap"]
    creation_data = {
        "presenter_lastname": "string",
        "presenter_firstname": "string",
        "title": "string",
        "intro": "string",
        "body": "string",
        "date": "2022-01-25T10:42:15Z",
        "thumbnail": "string",
    }

    def test_list(self):
        """TrapViewSet 'list' returns list of trap"""
        url = reverse("trap-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(list(response.data[0].keys()), TrapFields)
        self.assertEqual(response.data[0]["presenter_firstname"], "user1")
        self.assertEqual(response.data[1]["presenter_firstname"], "user2")
        self.assertEqual(
            response.data[1]["title"], "ECS 2023 Presentation et retour de conference"
        )





    def test_retrieve(self):
        """TrapViewSet 'retrieve' returns trap details"""
        url = reverse("trap-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), TrapFields)
        self.assertEqual(response.data["presenter_firstname"], "user1")
        self.assertEqual(
            response.data["title"],
            "Assessing marine mammal diversity in remote Indian Ocean regions, using an acoustic glider",
        )
        self.assertEqual(
            response.data["intro"],
            "Her order another who company step office. Garden space various suddenly. Character large standard attention. Pass time special according role carry base.",
        )

