"""Test AnnotationFileRangeViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring, duplicate-code, too-many-public-methods
import os
from typing import Optional

from django.db.models import QuerySet
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationResult,
    AnnotationCampaign,
    LabelSet,
    Dataset,
    SpectrogramConfiguration,
    ConfidenceIndicatorSet,
    AnnotationTask,
    AnnotationCampaignPhase,
    Phase,
    ConfidenceIndicator,
    ConfidenceIndicatorSetIndicator,
)
from backend.utils.tests import AuthenticatedTestCase, upload_csv_file_as_string

URL = reverse(
    "annotation-result-campaign-import", kwargs={"campaign_id": 1, "phase_id": 1}
)
URL_unknown_campaign = reverse(
    "annotation-result-campaign-import", kwargs={"campaign_id": 27, "phase_id": 57}
)

DATASET_NAME = "SPM Aural A 2010"
detectors_map = {"detector1": {"detector": "nnini", "configuration": "test"}}


class ImportUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = upload_csv_file_as_string(
            self,
            URL,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ImportBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user3"
    fixtures = [
        "users",
        "datasets",
    ]

    def _get_url(
        self,
        _dataset_name=DATASET_NAME,
        # pylint: disable=dangerous-default-value
        _detectors_map: dict = detectors_map,
        phase_type: Phase = Phase.ANNOTATION,
        label_set: Optional[LabelSet] = None,
        confidence_set: Optional[ConfidenceIndicatorSet] = None,
    ):
        campaign = AnnotationCampaign.objects.create(
            name="string",
            desc="string",
            instructions_url="string",
            deadline="2022-01-30",
            created_at="2012-01-14T00:00:00Z",
            label_set=label_set or LabelSet.objects.create(name="string label set"),
            confidence_indicator_set=confidence_set,
            owner_id=3,
        )
        phase = AnnotationCampaignPhase.objects.create(
            phase=phase_type,
            annotation_campaign=campaign,
            created_by_id=3,
        )
        verification_phase, _ = AnnotationCampaignPhase.objects.get_or_create(
            phase=Phase.VERIFICATION,
            annotation_campaign=campaign,
            created_by_id=3,
        )
        task = AnnotationTask.objects.create(
            annotation_campaign_phase=verification_phase,
            dataset_file_id=2,
            annotator_id=1,
            status=AnnotationTask.Status.FINISHED,
        )
        campaign.datasets.add(Dataset.objects.get(pk=1))
        campaign.spectro_configs.add(SpectrogramConfiguration.objects.get(pk=1))

        return (
            reverse(
                "annotation-result-campaign-import",
                kwargs={
                    "campaign_id": campaign.id,
                    "phase_id": phase.id,
                },
            )
            + f"?dataset_name={_dataset_name}&detectors_map={_detectors_map}",
            phase.id,
            task.id,
        )

    def test_post_unknown_campaign(self):
        response = upload_csv_file_as_string(
            self,
            URL,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_post_strong_one_file(self):
        url, _, _ = self._get_url()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ImportAnnotatorAuthenticatedTestCase(ImportBaseUserAuthenticatedTestCase):
    username = "user2"


class ImportCampaignOwnerAuthenticatedTestCase(ImportBaseUserAuthenticatedTestCase):
    username = "user1"

    def __check_global_result(self, response: dict):
        self.assertEqual(response["label"], "click")
        self.assertEqual(response["confidence_indicator"], "sure")
        self.assertEqual(response["annotator"], None)
        self.assertEqual(response["comments"], [])
        self.assertEqual(response["validations"], [])
        self.assertEqual(response["detector_configuration"]["detector"], "nnini")
        self.assertEqual(response["detector_configuration"]["configuration"], "test")
        self.assertIsNotNone(LabelSet.objects.get(name="string label set"))
        self.assertIsNotNone(ConfidenceIndicatorSet.objects.get(name="string"))

    def __check_weak_one_file_annotation(
        self,
        response: dict,
        result: AnnotationResult,
        phase_id: int,
    ):
        self.__check_global_result(response)
        self.assertEqual(response["id"], result.id)
        self.assertEqual(response["annotation_campaign_phase"], phase_id)
        self.assertEqual(response["dataset_file"], 1)
        self.assertEqual(response["start_time"], None)
        self.assertEqual(response["end_time"], None)
        self.assertEqual(response["start_frequency"], None)
        self.assertEqual(response["end_frequency"], None)
        self.assertEqual(response["type"], "Weak")

    def __check_weak_two_files_annotation(
        self,
        response: list[dict],
        results: QuerySet[AnnotationResult],
        phase_id: int,
    ):
        result_1 = results.first()
        self.__check_global_result(response[0])
        # First annotation cover all file -> weak
        self.assertEqual(response[0]["id"], result_1.id)
        self.assertEqual(response[0]["annotation_campaign_phase"], phase_id)
        self.assertEqual(response[0]["dataset_file"], 1)
        self.assertEqual(response[0]["start_time"], None)
        self.assertEqual(response[0]["end_time"], None)
        self.assertEqual(response[0]["start_frequency"], None)
        self.assertEqual(response[0]["end_frequency"], None)
        self.assertEqual(response[0]["type"], "Weak")
        result_2 = results.exclude(id=result_1.id).first()
        # Second annotation doesn't cover all file -> strong
        self.__check_global_result(response[1])
        self.assertEqual(response[1]["id"], result_2.id)
        self.assertEqual(response[1]["annotation_campaign_phase"], phase_id)
        self.assertEqual(response[1]["dataset_file"], 2)
        self.assertEqual(response[1]["start_time"], 0)
        self.assertEqual(response[1]["end_time"], 10 * 60)
        self.assertEqual(response[1]["start_frequency"], 0)
        self.assertEqual(response[1]["end_frequency"], 64_000)
        self.assertEqual(response[1]["type"], "Box")

    def __check_point_annotation(
        self,
        response: dict,
        result: AnnotationResult,
        phase_id: int,
    ):
        self.__check_global_result(response)
        self.assertEqual(response["id"], result.id)
        self.assertEqual(response["annotation_campaign_phase"], phase_id)
        self.assertEqual(response["dataset_file"], 1)
        self.assertEqual(response["start_time"], 0.8)
        self.assertEqual(response["end_time"], None)
        self.assertEqual(response["start_frequency"], 32416)
        self.assertEqual(response["end_frequency"], None)
        self.assertEqual(response["type"], "Point")

    def __check_strong_one_file_annotation(
        self,
        response: dict,
        result: AnnotationResult,
        phase_id: int,
    ):
        self.__check_global_result(response)
        self.assertEqual(response["id"], result.id)
        self.assertEqual(response["annotation_campaign_phase"], phase_id)
        self.assertEqual(response["dataset_file"], 1)
        self.assertEqual(response["start_time"], 0.8)
        self.assertEqual(response["end_time"], 1.8)
        self.assertEqual(response["start_frequency"], 32416)
        self.assertEqual(response["end_frequency"], 53916)
        self.assertEqual(response["type"], "Box")

    def __check_strong_two_files_annotation(
        self,
        response: list[dict],
        results: QuerySet[AnnotationResult],
        phase_id: int,
    ):
        result_1 = results.first()
        self.__check_global_result(response[0])
        self.assertEqual(response[0]["id"], result_1.id)
        self.assertEqual(response[0]["annotation_campaign_phase"], phase_id)
        self.assertEqual(response[0]["dataset_file"], 1)
        self.assertEqual(response[0]["start_time"], 0.8)
        self.assertEqual(response[0]["end_time"], 15 * 60)
        self.assertEqual(response[0]["start_frequency"], 32416)
        self.assertEqual(response[0]["end_frequency"], 53916)
        self.assertEqual(response[0]["type"], "Box")
        result_2 = results.exclude(id=result_1.id).first()
        self.__check_global_result(response[1])
        self.assertEqual(response[1]["id"], result_2.id)
        self.assertEqual(response[1]["annotation_campaign_phase"], phase_id)
        self.assertEqual(response[1]["dataset_file"], 2)
        self.assertEqual(response[1]["start_time"], 0)
        self.assertEqual(response[1]["end_time"], 8)
        self.assertEqual(response[1]["start_frequency"], 32416)
        self.assertEqual(response[1]["end_frequency"], 53916)
        self.assertEqual(response[1]["type"], "Box")

    # Common

    def test_empty_post_duplicate_used_label_set(self):
        old_label_set = LabelSet.objects.create(name="Filled")
        old_label_set.labels.create(name="Whale")
        old_label_set.labels.create(name="Dolphins")

        url, phase_id, task_id = self._get_url(label_set=old_label_set)

        AnnotationCampaign.objects.create(
            name="Other", label_set=old_label_set, owner_id=1
        )

        old_count = AnnotationResult.objects.count()
        old_set_count = LabelSet.objects.count()
        phase = AnnotationCampaignPhase.objects.get(id=phase_id)
        old_labels_count = phase.annotation_campaign.label_set.labels.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/weak_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.FINISHED,
        )

        self.assertEqual(LabelSet.objects.count(), old_set_count + 1)
        phase = AnnotationCampaignPhase.objects.get(id=phase_id)
        self.assertEqual(
            phase.annotation_campaign.label_set.labels.count(), old_labels_count + 1
        )
        self.assertNotEqual(phase.annotation_campaign.label_set, old_label_set)
        self.assertEqual(old_label_set.labels.count(), old_labels_count)

    def test_empty_post_duplicate_used_confidence_set(self):
        old_confidence_set = ConfidenceIndicatorSet.objects.create(name="Filled")
        ConfidenceIndicatorSetIndicator.objects.get_or_create(
            confidence_indicator=ConfidenceIndicator.objects.create(
                label="Not confident", level=0
            ),
            confidence_indicator_set=old_confidence_set,
        )
        ConfidenceIndicatorSetIndicator.objects.get_or_create(
            confidence_indicator=ConfidenceIndicator.objects.create(
                label="Confident", level=1
            ),
            confidence_indicator_set=old_confidence_set,
        )

        url, phase_id, task_id = self._get_url(confidence_set=old_confidence_set)
        phase = AnnotationCampaignPhase.objects.get(id=phase_id)

        AnnotationCampaign.objects.create(
            name="Other",
            label_set=phase.annotation_campaign.label_set,
            owner_id=1,
            confidence_indicator_set=old_confidence_set,
        )

        old_count = AnnotationResult.objects.count()
        old_set_count = ConfidenceIndicatorSet.objects.count()
        phase = AnnotationCampaignPhase.objects.get(id=phase_id)
        old_indicators_count = (
            phase.annotation_campaign.confidence_indicator_set.confidence_indicators.count()
        )
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/weak_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.FINISHED,
        )

        self.assertEqual(LabelSet.objects.count(), old_set_count + 1)
        phase = AnnotationCampaignPhase.objects.get(id=phase_id)
        self.assertEqual(
            phase.annotation_campaign.confidence_indicator_set.confidence_indicators.count(),
            old_indicators_count + 1,
        )
        self.assertNotEqual(
            phase.annotation_campaign.confidence_indicator_set, old_confidence_set
        )
        self.assertEqual(
            old_confidence_set.confidence_indicators.count(), old_indicators_count
        )

    def test_empty_post_weak_one_file(self):
        url, phase_id, task_id = self._get_url()
        old_count = AnnotationResult.objects.count()
        phase = AnnotationCampaignPhase.objects.get(id=phase_id)
        self.assertEqual(phase.annotation_campaign.label_set.labels.count(), 0)
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/weak_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.FINISHED,
        )

        result = AnnotationResult.objects.latest("id")
        self.__check_weak_one_file_annotation(response.data[0], result, phase_id)

        self.assertEqual(phase.annotation_campaign.label_set.labels.count(), 1)

    def test_empty_post_weak_one_file_twice(self):
        url, _, task_id = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/weak_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/weak_one_file_annotation.csv",
        )
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.FINISHED,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

    def test_empty_post_weak_two_file(self):
        url, phase_id, task_id = self._get_url()
        old_results = AnnotationResult.objects.all()
        old_count = old_results.count()
        old_ids = list(old_results.values_list("id", flat=True))
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/weak_two_files_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 2)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.CREATED,
        )

        results = AnnotationResult.objects.exclude(id__in=old_ids)
        self.__check_weak_two_files_annotation(response.data, results, phase_id)

    def test_empty_point(self):
        url, phase_id, task_id = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/point_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.FINISHED,
        )

        result = AnnotationResult.objects.latest("id")
        self.__check_point_annotation(response.data[0], result, phase_id)

    def test_empty_point_no_end_frequency(self):
        url, phase_id, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/point_annotation_no_end_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

        result = AnnotationResult.objects.latest("id")
        self.__check_point_annotation(response.data[0], result, phase_id)

    def test_empty_post_strong_one_file(self):
        url, phase_id, task_id = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.FINISHED,
        )

        result = AnnotationResult.objects.latest("id")
        self.__check_strong_one_file_annotation(response.data[0], result, phase_id)

    def test_empty_post_strong_two_file(self):
        url, phase_id, task_id = self._get_url()
        old_results = AnnotationResult.objects.all()
        old_count = old_results.count()
        old_ids = list(old_results.values_list("id", flat=True))
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_two_files_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 2)
        self.assertEqual(
            AnnotationTask.objects.get(id=task_id).status,
            AnnotationTask.Status.CREATED,
        )

        results = AnnotationResult.objects.exclude(id__in=old_ids)
        self.__check_strong_two_files_annotation(response.data, results, phase_id)

    # Errors

    def test_empty_post_without_is_box(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/no_is_box.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("is_box")[0].code, "invalid")

    def test_empty_post_unknown_dataset(self):
        url, _, _ = self._get_url(_dataset_name="Another Dataset")
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("dataset")[0].code, "does_not_exist")

    def test_empty_post_empty_dataset(self):
        url, _, _ = self._get_url(_dataset_name="")
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("dataset")[0].code, "null")

    def test_empty_post_without_detector(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/no_detector.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

    def test_empty_post_map_empty(self):
        url, _, _ = self._get_url(_detectors_map={})
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

    def test_empty_post_map_detector_empty_string(self):
        url, _, _ = self._get_url(
            _detectors_map={"detector1": {"detector": "", "configuration": "test"}}
        )
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            response.data[0]["detector_configuration"]["detector"], "detector1"
        )

    def test_empty_post_map_detector_none(self):
        url, _, _ = self._get_url(
            _detectors_map={"detector1": {"detector": None, "configuration": "test"}}
        )
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            response.data[0]["detector_configuration"]["detector"], "detector1"
        )

    def test_empty_post_map_detector_missing(self):
        url, _, _ = self._get_url(
            _detectors_map={"detector1": {"configuration": "test"}}
        )
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)
        self.assertEqual(
            response.data[0]["detector_configuration"]["detector"], "detector1"
        )

    def test_empty_post_map_config_empty_string(self):
        url, _, _ = self._get_url(
            _detectors_map={"detector1": {"detector": "nnini", "configuration": ""}}
        )
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("detector_config")[0].code, "blank")

    def test_empty_post_map_config_none(self):
        url, _, _ = self._get_url(
            _detectors_map={"detector1": {"detector": "nnini", "configuration": None}}
        )
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("detector_config")[0].code, "null")

    def test_empty_post_map_config_missing(self):
        url, _, _ = self._get_url(_detectors_map={"detector1": {"detector": "nnini"}})
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("detector_config")[0].code, "null")

    def test_empty_post_without_time(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/no_time.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("start_datetime")[0].code, "invalid")
        self.assertEqual(response.data[0].get("end_datetime")[0].code, "invalid")

    def test_empty_post_incorrect_time(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/incorrect_time.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("non_field_errors")[0].code, "invalid")

    def test_empty_post_incorrect_time_forced(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url + "&force_datetime=true",
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/incorrect_time.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

    def test_empty_post_without_frequency(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/no_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("min_frequency")[0].code, "invalid")

    def test_empty_post_bellow_frequency(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/bellow_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("min_frequency")[0].code, "min_value")
        self.assertEqual(response.data[0].get("max_frequency")[0].code, "min_value")

    def test_empty_post_min_over_frequency(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/over_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("min_frequency")[0].code, "max_value")

    def test_empty_post_max_over_frequency(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/max_over_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("max_frequency")[0].code, "max_value")

    def test_empty_post_over_frequency_forced(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url + "&force_max_frequency=true",
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/over_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

    def test_empty_post_max_over_frequency_forced(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url + "&force_max_frequency=true",
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/max_over_frequency.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AnnotationResult.objects.count(), old_count + 1)

    def test_empty_post_without_label(self):
        url, _, _ = self._get_url()
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/no_label.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)

        self.assertEqual(response.data[0].get("label")[0].code, "null")

    def test_empty_post_on_verification_phase(self):
        url, _, _ = self._get_url(phase_type=Phase.VERIFICATION)
        old_count = AnnotationResult.objects.count()
        response = upload_csv_file_as_string(
            self,
            url,
            f"{os.path.dirname(os.path.realpath(__file__))}/import_csv/strong_one_file_annotation.csv",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AnnotationResult.objects.count(), old_count)
        self.assertEqual(
            response.data, "Import should always be made on annotation campaign"
        )


class ImportAdminAuthenticatedTestCase(ImportCampaignOwnerAuthenticatedTestCase):
    username = "admin"
