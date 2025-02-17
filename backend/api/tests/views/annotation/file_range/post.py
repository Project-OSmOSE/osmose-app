"""Test AnnotationFileRangeViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
import json

from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APITestCase

from backend.api.models import AnnotationFileRange
from backend.utils.tests import AuthenticatedTestCase, all_fixtures

URL = reverse("annotation-file-range-campaign", kwargs={"campaign_id": 1})
URL_unknown_campaign = reverse(
    "annotation-file-range-campaign", kwargs={"campaign_id": 27}
)

existing_ranges = [
    {
        "id": 1,
        "first_file_index": 0,
        "last_file_index": 5,
        "annotator": 1,
        "annotation_campaign": 1,
    },
    {
        "id": 3,
        "first_file_index": 6,
        "last_file_index": 9,
        "annotator": 4,
        "annotation_campaign": 1,
    },
]
basic_create_range = {
    "first_file_index": 1,
    "last_file_index": 3,
    "annotator": 4,
}


class PostUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(
            URL,
            data=json.dumps([basic_create_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = all_fixtures

    def test_post(self):
        response = self.client.post(
            URL,
            data=json.dumps([basic_create_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_unknown_campaign(self):
        response = self.client.post(
            URL_unknown_campaign,
            data=json.dumps(
                [
                    {
                        **basic_create_range,
                        "annotation_campaign": 27,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PostCampaignOwnerAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user1"
    fixtures = all_fixtures

    def post(self, data: list[dict]) -> Response:
        response = self.client.post(
            URL,
            data=json.dumps(data),
            content_type="application/json",
        )
        return response

    def test_post(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(existing_ranges + [basic_create_range])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationFileRange.objects.count(), initial_count + 1)

    def test_post_duplicated(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "first_file_index": 6,
                    "last_file_index": 9,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_bellow_range(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "first_file_index": -2,
                    "last_file_index": -1,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[2].get("first_file_index")[0].code, "min_value")
        self.assertEqual(response.data[2].get("last_file_index")[0].code, "min_value")

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_over_range(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [{"first_file_index": 20, "last_file_index": 32, "annotator": 4}]
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[2].get("first_file_index")[0].code, "max_value")
        self.assertEqual(response.data[2].get("last_file_index")[0].code, "max_value")

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_wrong_limit_sort(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "first_file_index": 5,
                    "last_file_index": 2,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[2].get("non_field_errors")[0].code, "value_order"
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_initial_overlapping(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "first_file_index": 7,
                    "last_file_index": 8,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[1]["first_file_index"], 6)
        self.assertEqual(response.data[1]["last_file_index"], 9)

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_new_overlapping(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "first_file_index": 4,
                    "last_file_index": 10,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[1]["first_file_index"], 4)
        self.assertEqual(response.data[1]["last_file_index"], 10)

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_sibling(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "first_file_index": 4,
                    "last_file_index": 5,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[1]["first_file_index"], 4)
        self.assertEqual(response.data[1]["last_file_index"], 9)

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_update(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post(
            existing_ranges
            + [
                {
                    "id": 3,
                    "first_file_index": 4,
                    "last_file_index": 5,
                    "annotator": 4,
                }
            ]
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[1]["id"], 3)
        self.assertEqual(response.data[1]["first_file_index"], 4)
        self.assertEqual(response.data[1]["last_file_index"], 5)

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_post_delete_all_with_finished_task(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post([])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationFileRange.objects.count(), initial_count - 2)

    def test_post_delete_all(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.client.post(
            reverse("annotation-file-range-campaign", kwargs={"campaign_id": 2}),
            data=json.dumps([]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count - 2)
        self.assertEqual(len(response.data), 0)

    def test_post_delete_one(self):
        initial_count = AnnotationFileRange.objects.count()
        response = self.post([existing_ranges[0]])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count - 1)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], existing_ranges[0]["id"])


class PostAdminAuthenticatedTestCase(PostCampaignOwnerAuthenticatedTestCase):
    username = "admin"
