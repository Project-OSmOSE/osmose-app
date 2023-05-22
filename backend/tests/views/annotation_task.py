"""Annotation task DRF-Viewset test file"""

from django.urls import reverse
from django.utils.dateparse import parse_datetime

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationTask


class AnnotationTaskViewSetUnauthenticatedTestCase(APITestCase):
    """Test AnnotationTaskViewSet when request is unauthenticated"""

    def test_campaign_list_unauthenticated(self):
        """AnnotationTask view 'campaign_list' returns 401 if no user is authenticated"""
        url = reverse("annotation-task-campaign-list", kwargs={"campaign_id": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_campaign_user_list_unauthenticated(self):
        """AnnotationTask view 'campaign_user_list' returns 401 if no user is authenticated"""
        url = reverse(
            "annotation-task-campaign-user-list",
            kwargs={"campaign_id": 1, "user_id": 1},
        )
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
        "annotation_sets",
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
            },
        )

    # Testing 'campaign_user_list'

    def test_campaign_user_list_for_staff(self):
        """AnnotationTask view 'campaign_user_list' returns list for staff"""
        self.client.login(username="staff", password="osmose29")
        url = reverse(
            "annotation-task-campaign-user-list",
            kwargs={"campaign_id": 1, "user_id": 1},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        self.assertEqual(
            dict(response.data[0]),
            {
                "dataset_name": "SPM Aural A 2010",
                "end": "2012-10-03T10:15:00Z",
                "filename": "sound001.wav",
                "id": 1,
                "start": "2012-10-03T10:00:00Z",
                "status": 0,
            },
        )

    def test_campaign_user_list_for_staff_plus_unknown_campaign(self):
        """AnnotationTask view 'campaign_user_list' returns 404 for staff with unknown campaign"""
        self.client.login(username="staff", password="osmose29")
        url = reverse(
            "annotation-task-campaign-user-list",
            kwargs={"campaign_id": 42, "user_id": 1},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_campaign_user_list_for_owner(self):
        """AnnotationTask view 'campaign_user_list' returns list for owner"""
        self.client.login(username="user1", password="osmose29")
        url = reverse(
            "annotation-task-campaign-user-list",
            kwargs={"campaign_id": 1, "user_id": 1},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)

    def test_campaign_user_list_for_owner_plus_unknown_user(self):
        """AnnotationTask view 'campaign_user_list' returns 404 for owner with unknown user"""
        self.client.login(username="user1", password="osmose29")
        url = reverse(
            "annotation-task-campaign-user-list",
            kwargs={"campaign_id": 1, "user_id": 42},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_campaign_user_list_for_user(self):
        """AnnotationTask view 'campaign_user_list' forbidden for unauthorized user"""
        url = reverse(
            "annotation-task-campaign-user-list",
            kwargs={"campaign_id": 1, "user_id": 1},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Testing 'retrieve'

    def test_retrieve(self):
        """AnnotationTask view 'retrieve' returns task data"""
        url = reverse("annotation-task-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            [
                "id",
                "campaignId",
                "annotationTags",
                "boundaries",
                "audioUrl",
                "audioRate",
                "spectroUrls",
                "prevAnnotations",
                "annotationScope",
                "task_comment",
            ],
        )
        self.assertEqual(
            response.data["annotationTags"],
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
        self.assertEqual(task.results.count(), 0)
        url = reverse("annotation-task-detail", kwargs={"pk": 9})
        response = self.client.put(
            url,
            {
                "annotations": [
                    {
                        "annotation": "Boat",
                        "startTime": 10,
                        "endTime": 50,
                        "startFrequency": 100,
                        "endFrequency": 200,
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
        self.assertEqual(task.results.count(), 1)

    def test_update_unknown(self):
        """AnnotationTask view 'update' returns 404 for unknown task"""
        url = reverse("annotation-task-detail", kwargs={"pk": 42})
        response = self.client.put(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
