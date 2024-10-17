"""Test AnnotationFileRangeViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring, duplicate-code
import json

from django.db.models import QuerySet
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationResult,
    AnnotationCampaign,
    AnnotationCampaignUsage,
    LabelSet,
    ConfidenceIndicatorSet,
    Dataset,
    SpectrogramConfiguration,
)
from backend.api.tests.utils import AuthenticatedTestCase

URL = reverse("annotation-result-campaign-import", kwargs={"campaign_id": 1})
URL_unknown_campaign = reverse(
    "annotation-result-campaign-import", kwargs={"campaign_id": 27}
)

weak_one_file_annotation = [
    {
        "is_box": False,
        "dataset": "SPM Aural A 2010",
        "detector": "nninni",
        "detector_config": "test",
        "start_datetime": "2012-10-03T10:00:00+00:00",
        "end_datetime": "2012-10-03T10:15:00+00:00",
        "min_time": 0,
        "max_time": 0,
        "min_frequency": 0,
        "max_frequency": 64000,
        "label": "click",
        "confidence_indicator": "sure",
    }
]
weak_two_files_annotation = [
    {
        "is_box": False,
        "dataset": "SPM Aural A 2010",
        "dataset_file": "sound001.wav",
        "detector": "nninni",
        "detector_config": "test",
        "start_datetime": "2012-10-03T10:00:00+00:00",
        "end_datetime": "2012-10-03T11:10:00+00:00",
        "min_time": 0,
        "max_time": 0,
        "min_frequency": 0,
        "max_frequency": 64000,
        "label": "click",
        "confidence_indicator": "sure",
    }
]
strong_one_file_annotation = [
    {
        "is_box": True,
        "dataset": "SPM Aural A 2010",
        "dataset_file": "sound001.wav",
        "detector": "nninni",
        "detector_config": "test",
        "start_datetime": "2012-10-03T10:00:00.800+00:00",
        "end_datetime": "2012-10-03T10:00:01.800+00:00",
        "min_time": 0.8,
        "max_time": 1.8,
        "min_frequency": 32416,
        "max_frequency": 53916,
        "label": "click",
        "confidence_indicator": "sure",
    }
]
strong_two_files_annotation = [
    {
        "is_box": True,
        "dataset": "SPM Aural A 2010",
        "dataset_file": "sound001.wav",
        "detector": "nninni",
        "detector_config": "test",
        "start_datetime": "2012-10-03T10:00:00.800+00:00",
        "end_datetime": "2012-10-03T11:00:08+00:00",
        "min_time": 0.8,
        "max_time": 3608,
        "min_frequency": 32416,
        "max_frequency": 53916,
        "label": "click",
        "confidence_indicator": "sure",
    }
]


class PostUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(
            URL,
            data=json.dumps(weak_one_file_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user3"
    fixtures = [
        "users",
        "datasets",
    ]

    def _get_url(self):
        campaign = AnnotationCampaign.objects.create(
            name="string",
            desc="string",
            instructions_url="string",
            deadline="2022-01-30T10:42:15Z",
            created_at="2012-01-14T00:00:00Z",
            usage=AnnotationCampaignUsage.CHECK,
            label_set=LabelSet.objects.create(name="string label set"),
            confidence_indicator_set=ConfidenceIndicatorSet.objects.create(
                name="confidence label set"
            ),
            owner_id=3,
        )
        campaign.datasets.add(Dataset.objects.get(pk=1))
        campaign.spectro_configs.add(SpectrogramConfiguration.objects.get(pk=1))
        campaign.label_set.labels.get_or_create(name="click")
        campaign.confidence_indicator_set.confidence_indicators.get_or_create(
            label="sure", level=1
        )
        campaign.confidence_indicator_set.confidence_indicators.get_or_create(
            label="not sure", level=0
        )

        return (
            reverse(
                "annotation-result-campaign-import",
                kwargs={"campaign_id": campaign.id},
            ),
            campaign.id,
        )

    def test_post_unknown_campaign(self):
        response = self.client.post(
            URL_unknown_campaign,
            data=json.dumps(weak_one_file_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_post_weak_one_file(self):
        url, _ = self._get_url()
        response = self.client.post(
            url,
            data=json.dumps(weak_one_file_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostAnnotatorAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user2"


class PostCampaignOwnerAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user1"

    def __check_global_result(self, response: dict):
        self.assertEqual(response["label"], "click")
        self.assertEqual(response["confidence_indicator"], "sure")
        self.assertEqual(response["annotator"], None)
        self.assertEqual(response["comments"], [])
        self.assertEqual(response["validations"], [])
        self.assertEqual(response["detector_configuration"]["configuration"], "test")
        self.assertEqual(response["detector_configuration"]["detector"], "nninni")

    def __check_weak_one_file_annotation(
        self,
        response: dict,
        result: AnnotationResult,
        campaign_id: int,
    ):
        self.__check_global_result(response)
        self.assertEqual(response["id"], result.id)
        self.assertEqual(response["annotation_campaign"], campaign_id)
        self.assertEqual(response["dataset_file"], 1)
        self.assertEqual(response["start_time"], None)
        self.assertEqual(response["end_time"], None)
        self.assertEqual(response["start_frequency"], None)
        self.assertEqual(response["end_frequency"], None)

    def __check_weak_two_files_annotation(
        self,
        response: list[dict],
        results: QuerySet[AnnotationResult],
        campaign_id: int,
    ):
        result_1 = results.first()
        self.__check_global_result(response[0])
        self.assertEqual(response[0]["id"], result_1.id)
        self.assertEqual(response[0]["annotation_campaign"], campaign_id)
        self.assertEqual(response[0]["dataset_file"], 1)
        self.assertEqual(response[0]["start_time"], 0)
        self.assertEqual(response[0]["end_time"], 15 * 60)
        self.assertEqual(response[0]["start_frequency"], 0)
        self.assertEqual(response[0]["end_frequency"], 64_000)
        result_2 = results.exclude(id=result_1.id).first()
        self.__check_global_result(response[1])
        self.assertEqual(response[1]["id"], result_2.id)
        self.assertEqual(response[1]["annotation_campaign"], campaign_id)
        self.assertEqual(response[1]["dataset_file"], 2)
        self.assertEqual(response[1]["start_time"], 0)
        self.assertEqual(response[1]["end_time"], 10 * 60)
        self.assertEqual(response[1]["start_frequency"], 0)
        self.assertEqual(response[1]["end_frequency"], 64_000)

    def __check_strong_one_file_annotation(
        self,
        response: dict,
        result: AnnotationResult,
        campaign_id: int,
    ):
        self.__check_global_result(response)
        self.assertEqual(response["id"], result.id)
        self.assertEqual(response["annotation_campaign"], campaign_id)
        self.assertEqual(response["dataset_file"], 1)
        self.assertEqual(response["start_time"], 0.8)
        self.assertEqual(response["end_time"], 1.8)
        self.assertEqual(response["start_frequency"], 32416)
        self.assertEqual(response["end_frequency"], 53916)

    def __check_strong_two_files_annotation(
        self,
        response: list[dict],
        results: QuerySet[AnnotationResult],
        campaign_id: int,
    ):
        result_1 = results.first()
        self.__check_global_result(response[0])
        self.assertEqual(response[0]["id"], result_1.id)
        self.assertEqual(response[0]["annotation_campaign"], campaign_id)
        self.assertEqual(response[0]["dataset_file"], 1)
        self.assertEqual(response[0]["start_time"], 0.8)
        self.assertEqual(response[0]["end_time"], 15 * 60)
        self.assertEqual(response[0]["start_frequency"], 32416)
        self.assertEqual(response[0]["end_frequency"], 53916)
        result_2 = results.exclude(id=result_1.id).first()
        self.__check_global_result(response[1])
        self.assertEqual(response[1]["id"], result_2.id)
        self.assertEqual(response[1]["annotation_campaign"], campaign_id)
        self.assertEqual(response[1]["dataset_file"], 2)
        self.assertEqual(response[1]["start_time"], 0)
        self.assertEqual(response[1]["end_time"], 8)
        self.assertEqual(response[1]["start_frequency"], 32416)
        self.assertEqual(response[1]["end_frequency"], 53916)

    # Common

    def test_empty_post_weak_one_file(self):
        url, campaign_id = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(weak_one_file_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_weak_one_file_annotation(response.data[0], result, campaign_id)

    def test_empty_post_weak_two_file(self):
        url, campaign_id = self._get_url()
        old_results = AnnotationResult.objects.all()
        old_count = old_results.count()
        old_ids = list(old_results.values_list("id", flat=True))
        response = self.client.post(
            url,
            data=json.dumps(weak_two_files_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 2)

        results = AnnotationResult.objects.exclude(id__in=old_ids)
        self.__check_weak_two_files_annotation(response.data, results, campaign_id)

    def test_empty_post_strong_one_file(self):
        url, campaign_id = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(strong_one_file_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_strong_one_file_annotation(response.data[0], result, campaign_id)

    def test_empty_post_strong_two_file(self):
        url, campaign_id = self._get_url()
        old_results = AnnotationResult.objects.all()
        old_count = old_results.count()
        old_ids = list(old_results.values_list("id", flat=True))
        response = self.client.post(
            url,
            data=json.dumps(strong_two_files_annotation),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 2)

        results = AnnotationResult.objects.exclude(id__in=old_ids)
        self.__check_strong_two_files_annotation(response.data, results, campaign_id)

    # Errors

    def test_empty_post_without_is_box(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "is_box": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("is_box")[0].code, "null")

    def test_empty_post_without_dataset(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "dataset": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("dataset")[0].code, "null")

    def test_empty_post_unknown_dataset(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "dataset": "Another Dataset",
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("dataset")[0].code, "does_not_exist")

    def test_empty_post_without_detector(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "detector": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("detector")[0].code, "null")

    def test_empty_post_without_detector_config(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "detector_config": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("detector_config")[0].code, "null")

    def test_empty_post_without_time(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "start_datetime": None,
                        "end_datetime": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("start_datetime")[0].code, "null")
        self.assertEqual(response.data[0].get("end_datetime")[0].code, "null")

    def test_empty_post_incorrect_time(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "start_datetime": "2032-10-03T10:00:00+00:00",
                        "end_datetime": "2032-10-03T10:15:00+00:00",
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("non_field_errors")[0].code, "invalid")

    def test_empty_post_without_frequency(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "min_frequency": None,
                        "max_frequency": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("min_frequency")[0].code, "null")
        self.assertEqual(response.data[0].get("max_frequency")[0].code, "null")

    def test_empty_post_bellow_frequency(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "min_frequency": -1,
                        "max_frequency": -1,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("min_frequency")[0].code, "min_value")
        self.assertEqual(response.data[0].get("max_frequency")[0].code, "min_value")

    def test_empty_post_over_frequency(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "min_frequency": 300_000,
                        "max_frequency": 300_000,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("min_frequency")[0].code, "max_value")
        self.assertEqual(response.data[0].get("max_frequency")[0].code, "max_value")

    def test_empty_post_without_label(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "label": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("label")[0].code, "null")

    def test_empty_post_unknown_label(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "label": "Dcall",
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("label")[0].code, "does_not_exist")

    def test_empty_post_without_confidence(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "confidence_indicator": None,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("confidence_indicator")[0].code, "null")

    def test_empty_post_unknown_confidence(self):
        url, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        **weak_one_file_annotation[0],
                        "confidence_indicator": "confident",
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(
            response.data[0].get("confidence_indicator")[0].code, "does_not_exist"
        )


class PostAdminAuthenticatedTestCase(PostCampaignOwnerAuthenticatedTestCase):
    username = "admin"
