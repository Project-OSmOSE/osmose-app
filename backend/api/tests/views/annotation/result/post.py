"""Test AnnotationFileRangeViewSet"""
# pylint: disable=duplicate-code
# pylint: disable=missing-class-docstring, missing-function-docstring, duplicate-code
import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationResult,
    AnnotationComment,
    AnnotationResultValidation,
)
from backend.utils.tests import AuthenticatedTestCase, all_fixtures

URL = reverse(
    "annotation-result-campaign-file", kwargs={"campaign_id": 1, "file_id": 9}
)
URL_with_annotations = reverse(
    "annotation-result-campaign-file", kwargs={"campaign_id": 1, "file_id": 7}
)
URL_unknown_campaign = reverse(
    "annotation-result-campaign-file", kwargs={"campaign_id": 27, "file_id": 1}
)
URL_unknown_file = reverse(
    "annotation-result-campaign-file", kwargs={"campaign_id": 1, "file_id": 27}
)

session = {"start": "2012-01-14T00:00:00Z", "end": "2012-01-14T00:15:00Z"}

create_presence_result = {
    "label": "Boat",
    "confidence_indicator": "confident",
}
create_box_result = {
    "label": "Boat",
    "confidence_indicator": "confident",
    "start_time": 0,
    "end_time": 10,
    "start_frequency": 5,
    "end_frequency": 25,
}


class PostUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(
            URL,
            data=json.dumps([create_presence_result, create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user3"
    fixtures = all_fixtures

    def test_post_unknown_campaign(self):
        response = self.client.post(
            URL_unknown_campaign,
            data=json.dumps([create_presence_result, create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_unknown_file(self):
        response = self.client.post(
            URL_unknown_file,
            data=json.dumps([create_presence_result, create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_post_presence(self):
        response = self.client.post(
            URL,
            data=json.dumps([create_presence_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PostAnnotatorAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    # pylint: disable=too-many-public-methods
    username = "user2"

    # Utils
    def __check_presence(
        self, response_result: dict, result: AnnotationResult, file_id: int
    ):
        self.assertEqual(response_result["id"], result.id)
        self.assertEqual(response_result["label"], "Boat")
        self.assertEqual(response_result["confidence_indicator"], "confident")
        self.assertEqual(response_result["start_time"], None)
        self.assertEqual(response_result["end_time"], None)
        self.assertEqual(response_result["start_frequency"], None)
        self.assertEqual(response_result["end_frequency"], None)
        self.assertEqual(response_result["annotation_campaign"], 1)
        self.assertEqual(response_result["annotator"], 4)
        self.assertEqual(response_result["dataset_file"], file_id)
        self.assertEqual(response_result["detector_configuration"], None)

    def __check_box(
        self, response_result: dict, result: AnnotationResult, file_id: int
    ):
        self.assertEqual(response_result["id"], result.id)
        self.assertEqual(response_result["label"], "Boat")
        self.assertEqual(response_result["confidence_indicator"], "confident")
        self.assertEqual(response_result["start_time"], 0)
        self.assertEqual(response_result["end_time"], 10)
        self.assertEqual(response_result["start_frequency"], 5)
        self.assertEqual(response_result["end_frequency"], 25)
        self.assertEqual(response_result["annotation_campaign"], 1)
        self.assertEqual(response_result["annotator"], 4)
        self.assertEqual(response_result["dataset_file"], file_id)
        self.assertEqual(response_result["detector_configuration"], None)

    def __check_delete_previous(self):
        deleted_results = AnnotationResult.objects.filter(id__in=[1, 2, 3])
        self.assertEqual(deleted_results.exists(), False)

    # Common

    def test_empty_post_presence(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps([create_presence_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_presence(response.data[0], result, 9)

    def test_empty_post_presence_with_comments(self):
        old_count = AnnotationResult.objects.count()
        old_comment_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "comments": [{"comment": "test A"}],
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_presence(response.data[0], result, 9)

        comment = AnnotationComment.objects.latest("id")
        self.assertEqual(AnnotationComment.objects.count(), old_comment_count + 1)
        self.assertEqual(len(response.data[0]["comments"]), 1)
        self.assertEqual(response.data[0]["comments"][0]["id"], comment.id)
        self.assertEqual(response.data[0]["comments"][0]["comment"], "test A")

    def test_empty_post_update_presence_with_comments(self):
        self.test_empty_post_presence_with_comments()
        result = AnnotationResult.objects.latest("id")
        old_count = AnnotationResult.objects.count()
        old_comment_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "id": result.id,
                        "comments": [{"comment": "test B"}],
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(AnnotationComment.objects.count(), old_comment_count)

        self.__check_presence(response.data[0], result, 9)

        comment = AnnotationComment.objects.latest("id")
        self.assertEqual(len(response.data[0]["comments"]), 1)
        self.assertEqual(response.data[0]["comments"][0]["id"], comment.id)
        self.assertEqual(response.data[0]["comments"][0]["comment"], "test B")

    def test_empty_post_presence_delete_comments(self):
        self.test_empty_post_presence_with_comments()
        result = AnnotationResult.objects.latest("id")
        old_count = AnnotationResult.objects.count()
        old_comment_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "id": result.id,
                        "comments": [],
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(AnnotationComment.objects.count(), old_comment_count - 1)

        self.__check_presence(response.data[0], result, 9)

        self.assertEqual(len(response.data[0]["comments"]), 0)

    def test_empty_post_presence_with_validation(self):
        old_count = AnnotationResult.objects.count()
        old_validation_count = AnnotationResultValidation.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "validations": [{"is_valid": True}],
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_presence(response.data[0], result, 9)

        validation = AnnotationResultValidation.objects.latest("id")
        self.assertEqual(
            AnnotationResultValidation.objects.count(), old_validation_count + 1
        )
        self.assertEqual(len(response.data[0]["validations"]), 1)
        self.assertEqual(response.data[0]["validations"][0]["id"], validation.id)
        self.assertEqual(response.data[0]["validations"][0]["is_valid"], True)

    def test_empty_post_update_presence_with_validations(self):
        self.test_empty_post_presence_with_validation()
        result = AnnotationResult.objects.latest("id")
        old_count = AnnotationResult.objects.count()
        old_validation_count = AnnotationResultValidation.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "id": result.id,
                        "validations": [{"is_valid": False}],
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(
            AnnotationResultValidation.objects.count(), old_validation_count
        )

        self.__check_presence(response.data[0], result, 9)

        validation = AnnotationResultValidation.objects.latest("id")
        self.assertEqual(len(response.data[0]["validations"]), 1)
        self.assertEqual(response.data[0]["validations"][0]["id"], validation.id)
        self.assertEqual(response.data[0]["validations"][0]["is_valid"], False)

    def test_empty_post_presence_delete_validations(self):
        self.test_empty_post_presence_with_validation()
        result = AnnotationResult.objects.latest("id")
        old_count = AnnotationResult.objects.count()
        old_validation_count = AnnotationResultValidation.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "id": result.id,
                        "validations": [],
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(
            AnnotationResultValidation.objects.count(), old_validation_count - 1
        )

        self.__check_presence(response.data[0], result, 9)

        self.assertEqual(len(response.data[0]["validations"]), 0)

    def test_empty_post_box(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps([create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_box(response.data[0], result, 9)

    def test_empty_post_all(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps([create_presence_result, create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 2)

        presence = AnnotationResult.objects.filter(start_time__isnull=True).latest("id")
        box = AnnotationResult.objects.exclude(id=presence.id).latest("id")
        self.__check_presence(response.data[0], presence, 9)
        self.__check_box(response.data[1], box, 9)

    def test_filled_post_presence(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL_with_annotations,
            data=json.dumps([create_presence_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count - 3 + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_presence(response.data[0], result, 7)
        self.__check_delete_previous()

    def test_filled_post_box(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL_with_annotations,
            data=json.dumps([create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count - 3 + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_box(response.data[0], result, 7)
        self.__check_delete_previous()

    def test_filled_post_all(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL_with_annotations,
            data=json.dumps([create_presence_result, create_box_result]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count - 3 + 2)

        presence = AnnotationResult.objects.filter(start_time__isnull=True).latest("id")
        box = AnnotationResult.objects.exclude(id=presence.id).latest("id")
        self.__check_presence(response.data[0], presence, 7)
        self.__check_box(response.data[1], box, 7)
        self.__check_delete_previous()

    def test_filled_post_empty(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL_with_annotations,
            data=json.dumps([]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count - 3)
        self.__check_delete_previous()

    def test_filled_post_update(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL_with_annotations,
            data=json.dumps(
                [
                    {
                        **create_box_result,
                        "id": 2,
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationResult.objects.count(), old_count - 3 + 1)
        self.__check_box(response.data[0], AnnotationResult.objects.get(pk=2), 7)

    # Errors

    def test_empty_post_empty_label(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [{**create_presence_result, "label": None}],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("label")[0].code, "null")

    def test_empty_post_unknown_label(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [{**create_presence_result, "label": "test"}],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("label")[0].code, "does_not_exist")

    def test_empty_post_wrong_label(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [{**create_presence_result, "label": "Dcall"}],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("label")[0].code, "does_not_exist")

    def test_empty_post_empty_confidence(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "confidence_indicator": None,
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("confidence_indicator")[0].code, "null")

    def test_empty_post_unknown_confidence(self):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_presence_result,
                        "confidence_indicator": "test",
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(
            response.data[0].get("confidence_indicator")[0].code, "does_not_exist"
        )

    def test_empty_post_time_bellow(
        self,
    ):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_box_result,
                        "start_time": -1,
                        "end_time": -1,
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("start_time")[0].code, "min_value")
        self.assertEqual(response.data[0].get("end_time")[0].code, "min_value")

    def test_empty_post_time_over(
        self,
    ):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_box_result,
                        "start_time": 16 * 60,
                        "end_time": 17 * 60,
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("start_time")[0].code, "max_value")
        self.assertEqual(response.data[0].get("end_time")[0].code, "max_value")

    def test_empty_post_frequency_bellow(
        self,
    ):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_box_result,
                        "start_frequency": -1,
                        "end_frequency": -1,
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("start_frequency")[0].code, "min_value")
        self.assertEqual(response.data[0].get("end_frequency")[0].code, "min_value")

    def test_empty_post_frequency_over(
        self,
    ):
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(
                [
                    {
                        **create_box_result,
                        "start_frequency": 130_000,
                        "end_frequency": 130_000,
                    }
                ],
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(response.data[0].get("start_frequency")[0].code, "max_value")
        self.assertEqual(response.data[0].get("end_frequency")[0].code, "max_value")


class PostCampaignOwnerAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user1"
    # Campaign owner does not have file range on campaign, so it should be
    # associated as a base user on post results permissions


class PostAdminAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "admin"
    # Admin file range does not include files 7 and 9 on campaign, so it
    # should be associated as a base user on post results permissions
