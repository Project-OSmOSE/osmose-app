# pylint: disable=missing-class-docstring, missing-function-docstring, duplicate-code
"""User DRF-Viewset test file"""
import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationResult,
    AnnotationComment,
)
from backend.utils.tests import AuthenticatedTestCase, all_fixtures

URL = reverse(
    "annotator-campaign-file", kwargs={"campaign_id": 1, "phase_id": 1, "file_id": 9}
)
URL_unknown_campaign = reverse(
    "annotator-campaign-file", kwargs={"campaign_id": -1, "phase_id": -1, "file_id": 9}
)
URL_unknown_file = reverse(
    "annotator-campaign-file", kwargs={"campaign_id": 1, "phase_id": 1, "file_id": -1}
)
URL_with_annotations = reverse(
    "annotator-campaign-file", kwargs={"campaign_id": 1, "phase_id": 1, "file_id": 7}
)

empty_data = {
    "results": [],
    "task_comments": [],
    "session": {"start": "2024-11-11T08:10", "end": "2024-11-11T08:15"},
}


class PostUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(
            URL, data=json.dumps(empty_data), content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user3"
    fixtures = all_fixtures

    def _check_delete_previous(self):
        deleted_results = AnnotationResult.objects.filter(id__in=[1, 2, 3])
        self.assertEqual(deleted_results.exists(), False)

    def test_post_unknown_campaign(self):
        response = self.client.post(
            URL_unknown_campaign,
            data=json.dumps(empty_data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_unknown_file(self):
        response = self.client.post(
            URL_unknown_file,
            data=json.dumps(empty_data),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post(self):
        response = self.client.post(
            URL, data=json.dumps(empty_data), content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PostCampaignOwnerAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user1"
    # Campaign owner does not have file range on campaign, so it should be
    # associated as a base user on post results permissions


class PostAdminAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "admin"
    # Admin file range does not include files 7 and 9 on campaign, so it
    # should be associated as a base user on post results permissions


# Empty - Test results
class PostAnnotatorAuthenticatedEmptyResultsTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user2"
    url = URL

    def _check_presence(
        self, response_result: dict, result: AnnotationResult, file_id: int
    ):
        self.assertEqual(response_result["id"], result.id)
        self.assertEqual(response_result["label"], "Boat")
        self.assertEqual(response_result["confidence_indicator"], "confident")
        self.assertEqual(response_result["start_time"], None)
        self.assertEqual(response_result["end_time"], None)
        self.assertEqual(response_result["start_frequency"], None)
        self.assertEqual(response_result["end_frequency"], None)
        self.assertEqual(response_result["annotation_campaign_phase"], 1)
        self.assertEqual(response_result["annotator"], 4)
        self.assertEqual(response_result["dataset_file"], file_id)
        self.assertEqual(response_result["detector_configuration"], None)

    def _check_box(self, response_result: dict, result: AnnotationResult, file_id: int):
        self.assertEqual(response_result["id"], result.id)
        self.assertEqual(response_result["label"], "Boat")
        self.assertEqual(response_result["confidence_indicator"], "confident")
        self.assertEqual(response_result["start_time"], 0)
        self.assertEqual(response_result["end_time"], 10)
        self.assertEqual(response_result["start_frequency"], 5)
        self.assertEqual(response_result["end_frequency"], 25)
        self.assertEqual(response_result["annotation_campaign_phase"], 1)
        self.assertEqual(response_result["annotator"], 4)
        self.assertEqual(response_result["dataset_file"], file_id)
        self.assertEqual(response_result["detector_configuration"], None)

    def test_post(self):
        old_count = AnnotationResult.objects.count()
        old_comment_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL, data=json.dumps(empty_data), content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(AnnotationComment.objects.count(), old_comment_count)
        self.assertEqual(len(response.data["results"]), 0)
        self.assertEqual(len(response.data["task_comments"]), 0)

    def test_post_all(self):
        result_old_count = AnnotationResult.objects.count()
        comment_old_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                {
                    "results": [
                        {
                            "label": "Boat",
                            "confidence_indicator": "confident",
                            "annotation_campaign_phase": 1,
                            "annotator": 4,
                        },
                        {
                            "label": "Boat",
                            "confidence_indicator": "confident",
                            "start_time": 0,
                            "end_time": 10,
                            "start_frequency": 5,
                            "end_frequency": 25,
                            "annotation_campaign_phase": 1,
                            "annotator": 4,
                        },
                    ],
                    "task_comments": [
                        {
                            "comment": "Test A",
                        }
                    ],
                    "session": {"start": "2024-11-11T08:10", "end": "2024-11-11T08:15"},
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), result_old_count + 2)
        self.assertEqual(AnnotationComment.objects.count(), comment_old_count + 1)
        presence = AnnotationResult.objects.filter(start_time__isnull=True).latest("id")
        box = AnnotationResult.objects.exclude(id=presence.id).latest("id")
        comment = AnnotationComment.objects.latest("id")
        self._check_presence(response.data["results"][0], presence, 9)
        self._check_box(response.data["results"][1], box, 9)
        self.assertEqual(comment.comment, "Test A")
