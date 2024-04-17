"""Annotation task DRF-Viewset test file"""

from django.urls import reverse
from django.utils.dateparse import parse_datetime

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationTask, AnnotationResult


class AnnotationTaskViewSetUnauthenticatedTestCase(APITestCase):
    """Test AnnotationTaskViewSet when request is unauthenticated"""

    def test_campaign_list_unauthenticated(self):
        """AnnotationTask view 'campaign_list' returns 401 if no user is authenticated"""
        url = reverse("annotation-task-campaign-list", kwargs={"campaign_id": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_unauthenticated(self):
        """AnnotationTask view 'retrieve' returns 401 if no user is authenticated"""
        url = reverse("annotation-task-detail", kwargs={"pk": 1})
        response = self.client.get(url)
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

    # Testing 'campaign_list'

    def test_campaign_list_for_user1(self):
        """AnnotationTask view 'campaign_list' returns no tasks for owner"""
        self.client.login(username="user1", password="osmose29")
        url = reverse("annotation-task-campaign-list", kwargs={"campaign_id": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_campaign_list_for_unknown_campaign(self):
        """AnnotationTask view 'campaign_list' returns 404 for unknown campaign"""
        url = reverse("annotation-task-campaign-list", kwargs={"campaign_id": 42})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_campaign_list_for_user2(self):
        """AnnotationTask view 'campaign_list' returns some tasks for annotator"""
        url = reverse("annotation-task-campaign-list", kwargs={"campaign_id": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
        self.assertEqual(
            dict(response.data[0]),
            {
                "dataset_name": "SPM Aural A 2010",
                "end": "2012-10-03T16:15:00Z",
                "filename": "sound007.wav",
                "id": 7,
                "start": "2012-10-03T16:00:00Z",
                "status": 0,
                "results_count": 3,
            },
        )

    # Testing 'retrieve'

    def test_retrieve(self):
        """AnnotationTask view 'retrieve' returns task data"""
        url = reverse("annotation-task-detail", kwargs={"pk": 1})
        response = self.client.get(url)

        print("list1", list(response.data.keys()))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
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
            response.data["labels"],
            ["Mysticetes", "Odoncetes", "Boat", "Rain", "Other"],
        )
        self.assertEqual(
            dict(response.data["boundaries"]),
            {
                "endFrequency": 16384.0,
                "endTime": parse_datetime("2012-10-03T10:15:00Z"),
                "startFrequency": 0,
                "startTime": parse_datetime("2012-10-03T10:00:00Z"),
            },
        )
        self.assertEqual(
            response.data["audioUrl"],
            "/backend/static/seed/dataset_path/audio/50h_0.wav",
        )
        self.assertEqual(len(response.data["spectroUrls"]), 1)
        self.assertEqual(
            list(response.data["spectroUrls"][0].keys()),
            ["nfft", "winsize", "overlap", "urls"],
        )
        self.assertEqual(len(response.data["spectroUrls"][0]["urls"]), 15)

    def test_retrieve_unknown(self):
        """AnnotationTask view 'retrieve' returns 404 for unknown task"""
        url = reverse("annotation-task-detail", kwargs={"pk": 42})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Testing 'update'

    def test_update(self):
        """AnnotationTask view 'update' returns next task info and updates task results"""
        task = AnnotationTask.objects.get(id=9)
        self.assertEqual(task.status, 0)
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
        self.assertEqual(task.status, 2)
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
