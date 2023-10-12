"""Annotation campaign DRF-Viewset test file"""
from datetime import datetime
from django.urls import reverse
from django.utils.dateparse import parse_datetime
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationCampaign, AnnotationTask


class AnnotationCampaignViewSetUnauthenticatedTestCase(APITestCase):
    """Test AnnotationCampaignViewSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """AnnotationCampaign view 'list' returns 401 if no user is authenticated"""
        url = reverse("annotation-campaign-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_unauthenticated(self):
        """AnnotationCampaign view 'retrieve' returns 401 if no user is authenticated"""
        url = reverse("annotation-campaign-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_unauthenticated(self):
        """AnnotationCampaign view 'create' returns 401 if no user is authenticated"""
        url = reverse("annotation-campaign-list")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_annotators_unauthenticated(self):
        """AnnotationCampaign view 'add_annotators' returns 401 if no user is authenticated"""
        url = reverse("annotation-campaign-add-annotators", kwargs={"pk": 1})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_report_unauthenticated(self):
        """AnnotationCampaign view 'report' returns 401 if no user is authenticated"""
        url = reverse("annotation-campaign-report", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AnnotationCampaignViewSetTestCase(APITestCase):
    """Test AnnotationCampaignViewSet when request is authenticated"""

    fixtures = [
        "users",
        "datasets",
        "annotation_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]
    creation_data = {
        "name": "string",
        "desc": "string",
        "instructions_url": "string",
        "start": "2022-01-25T10:42:15Z",
        "end": "2022-01-30T10:42:15Z",
        "created_at": "2023-11-02T00:00:00Z",
        "annotation_set_id": 1,
        "datasets": [1],
        "spectros": [1],
        "annotators": [1, 2],
        "annotation_method": 1,
        "annotation_goal": 1,
        "annotation_scope": 1,
    }
    add_annotators_data = {
        "annotators": [3],
        "annotation_method": 1,
        "annotation_goal": 5,
    }

    def setUp(self):
        self.client.login(username="user1", password="osmose29")  # campaign1 owner

    def tearDown(self):
        self.client.logout()

    # Testing 'list'

    def test_list(self):
        """AnnotationCampaign view 'list' returns list of campaigns"""
        url = reverse("annotation-campaign-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            list(response.data[0].keys()),
            [
                "id",
                "name",
                "desc",
                "instructions_url",
                "start",
                "end",
                "annotation_set_id",
                "tasks_count",
                "user_tasks_count",
                "complete_tasks_count",
                "user_complete_tasks_count",
                "files_count",
                "created_at",
            ],
        )
        self.assertEqual(response.data[0]["name"], "Test SPM campaign")
        self.assertEqual(response.data[0]["tasks_count"], 11)

    # Testing 'retrieve'

    def test_retrieve(self):
        """AnnotationCampaign view 'retrieve' returns campaign details"""
        url = reverse("annotation-campaign-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(response.data.keys()), ["campaign", "tasks"])
        self.assertEqual(
            list(response.data["campaign"].keys()),
            [
                "id",
                "name",
                "desc",
                "instructions_url",
                "start",
                "end",
                "annotation_set_id",
                "datasets",
                "created_at",
            ],
        )

        self.assertEqual(response.data["campaign"]["name"], "Test SPM campaign")
        self.assertEqual(len(response.data["tasks"]), 2)
        self.assertEqual(
            dict(response.data["tasks"][0]),
            {"annotator_id": 1, "count": 6, "status": 0},
        )

    def test_retrieve_for_unknown_campaign(self):
        """AnnotationCampaign view 'retrieve' returns 404 for unknown campaign"""
        url = reverse("annotation-campaign-detail", kwargs={"pk": 42})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Testing 'create'

    def test_create(self):
        """AnnotationCampaign view 'create' adds new campaign to DB and returns campaign info"""
        old_count = AnnotationCampaign.objects.count()
        old_tasks_count = AnnotationTask.objects.count()
        url = reverse("annotation-campaign-list")
        response = self.client.post(url, self.creation_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)
        self.assertEqual(AnnotationTask.objects.count(), old_tasks_count + 11)
        expected_reponse = {
            key: self.creation_data[key]
            for key in [
                "name",
                "desc",
                "instructions_url",
                "start",
                "end",
                "annotation_set_id",
                "datasets",
            ]
        }
        expected_reponse["id"] = AnnotationCampaign.objects.latest("id").id
        created_at = response.data.pop("created_at")
        self.assertEqual(dict(response.data), expected_reponse)

    # Testing 'add_annotators'

    def test_add_annotators_for_owner(self):
        """AnnotationCampaign view 'add_annotator' adds annotators and returns for owner"""
        url = reverse("annotation-campaign-add-annotators", kwargs={"pk": 1})
        files_target = self.add_annotators_data["annotation_goal"]
        new_annotator = User.objects.get(id=self.add_annotators_data["annotators"][0])
        old_user_count = new_annotator.annotation_tasks.count()
        old_tasks_count = AnnotationTask.objects.count()
        response = self.client.post(url, self.add_annotators_data)
        self.assertEqual(
            new_annotator.annotation_tasks.count(), old_user_count + files_target
        )
        self.assertEqual(AnnotationTask.objects.count(), old_tasks_count + files_target)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_annotators_for_staff(self):
        """AnnotationCampaign view 'add_annotator' works for staff"""
        self.client.login(username="staff", password="osmose29")
        url = reverse("annotation-campaign-add-annotators", kwargs={"pk": 1})
        response = self.client.post(url, self.add_annotators_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_annotators_for_unknown_campaign(self):
        """AnnotationCampaign view 'add_annotator' returns 404 for unknown campaign"""
        url = reverse("annotation-campaign-add-annotators", kwargs={"pk": 42})
        response = self.client.post(url, self.add_annotators_data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_annotators_for_user(self):
        """AnnotationCampaign view 'add_annotator' forbidden for other user"""
        self.client.login(username="user2", password="osmose29")
        url = reverse("annotation-campaign-add-annotators", kwargs={"pk": 1})
        response = self.client.post(url, self.add_annotators_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Testing 'report'

    def test_report(self):
        """AnnotationCampaign view 'report' returns CSV report"""
        url = reverse("annotation-campaign-report", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 10)
        self.assertEqual(
            response.data[0],
            [
                "dataset",
                "filename",
                "start_time",
                "end_time",
                "start_frequency",
                "end_frequency",
                "annotation",
                "annotator",
                "start_datetime",
                "end_datetime",
                "is_box",
                "comments",
            ],
        )
        self.assertEqual(
            response.data[1],
            [
                "SPM Aural A 2010",
                "sound007.wav",
                "119.63596249310535",
                "278.48869277440707",
                "6432.0",
                "12864.0",
                "Odoncetes",
                "user2",
                "2012-10-03T16:01:59.635+00:00",
                "2012-10-03T16:04:38.488+00:00",
                "1",
                "",
            ],
        )

    # Testing 'report_status'

    def test_report_status(self):
        """AnnotationCampaign view 'report_status' returns CSV report"""
        url = reverse("annotation-campaign-report-status", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 12)
        self.assertEqual(response.data[0], ["dataset", "filename", "admin", "user2"])
        self.assertEqual(
            response.data[1],
            ["SPM Aural A 2010", "sound001.wav", "CREATED", "UNASSIGNED"],
        )
