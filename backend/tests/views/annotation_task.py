"""Annotation task DRF-Viewset test file"""

from django.urls import reverse
from django.utils.dateparse import parse_datetime

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationTask, AnnotationResult
from backend.api.serializers.annotation_task import (
    AnnotationTaskSpectroSerializerFields,
)


class AnnotationTaskViewSetUnauthenticatedTestCase(APITestCase):
    """Test AnnotationTaskViewSet when request is unauthenticated"""

    def test_campaign_list_unauthenticated(self):
        """AnnotationTask view 'campaign_list' returns 401 if no user is authenticated"""
        url = reverse("annotation-task-list")
        response = self.client.get(
            url,
            {
                "annotation_campaign": 1,
                "dataset_file": 1,
                "for_current_user": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_unauthenticated(self):
        """AnnotationTask view 'update' returns 401 if no user is authenticated"""
        url = reverse("annotation-task-detail", kwargs={"pk": 1})
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AnnotationTaskViewSetTestCase(APITestCase):
    """Test AnnotationTaskViewSet when request is authenticated"""

    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]

    def setUp(self):
        self.client.login(
            username="user2", password="osmose29"
        )  # campaign annotator, user1 is owner

    def tearDown(self):
        self.client.logout()

    # Testing 'retrieve'

    def test_retrieve(self):
        """AnnotationTask view 'retrieve' returns task data"""
        self.client.login(username="admin", password="osmose29")
        url = reverse("annotation-task-list")
        response = self.client.get(
            url,
            {
                "annotation_campaign": 1,
                "dataset_file": 1,
                "for_current_user": True,
            },
        )
        response_task = response.data[0]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response_task.keys()),
            [
                "id",
                "campaignId",
                "campaignName",
                "labels",
                "boundaries",
                "audioUrl",
                "audioRate",
                "spectroUrls",
                "prevAnnotations",
                "annotationScope",
                "prevAndNextAnnotation",
                "taskComment",
                "confidenceIndicatorSet",
                "mode",
                "instructions_url",
            ],
        )
        self.assertEqual(
            response_task["labels"],
            ["Mysticetes", "Odoncetes", "Boat", "Rain", "Other"],
        )
        self.assertEqual(
            dict(response_task["boundaries"]),
            {
                "endFrequency": 64000.0,
                "endTime": parse_datetime("2012-10-03T10:15:00Z"),
                "startFrequency": 0,
                "startTime": parse_datetime("2012-10-03T10:00:00Z"),
            },
        )
        self.assertEqual(
            response_task["audioUrl"],
            "/backend/static/seed/dataset_path/audio/50h_0.wav",
        )
        self.assertEqual(len(response_task["spectroUrls"]), 1)
        self.assertEqual(
            list(response_task["spectroUrls"][0].keys()),
            AnnotationTaskSpectroSerializerFields,
        )
        self.assertEqual(len(response_task["spectroUrls"][0]["urls"]), 15)

    def test_retrieve_unknown(self):
        """AnnotationTask view 'retrieve' returns 404 for unknown task"""
        url = reverse("annotation-task-list")
        response = self.client.get(
            url,
            {
                "annotation_campaign": 42,
                "dataset_file": 1,
                "for_current_user": True,
            },
        )
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Testing 'update'

    def test_update(self):
        """AnnotationTask view 'update' returns next task info and updates task results"""
        task = AnnotationTask.objects.get(id=9)
        self.assertEqual(task.status, "C")
        results_count = AnnotationResult.objects.filter(
            annotation_campaign_id=task.annotation_campaign_id,
            annotator_id=task.annotator_id,
            dataset_file_id=task.dataset_file_id,
        ).count()
        self.assertEqual(results_count, 0)
        url = reverse("annotation-task-detail", kwargs={"pk": 9})
        response = self.client.put(
            url,
            {
                "annotations": [
                    {
                        "label": "Boat",
                        "startTime": 10,
                        "endTime": 50,
                        "startFrequency": 100,
                        "endFrequency": 200,
                        "result_comments": None,
                        "confidenceIndicator": "confident",
                    }
                ],
                "task_start_time": 10,
                "task_end_time": 60,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(dict(response.data), {"next_task": 10, "campaign_id": None})
        task.refresh_from_db()
        self.assertEqual(task.status, "F")
        results_count = AnnotationResult.objects.filter(
            annotation_campaign_id=task.annotation_campaign_id,
            annotator_id=task.annotator_id,
            dataset_file_id=task.dataset_file_id,
        ).count()
        self.assertEqual(results_count, 1)

    def test_update_unknown(self):
        """AnnotationTask view 'update' returns 404 for unknown task"""
        url = reverse("annotation-task-detail", kwargs={"pk": 42})
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
