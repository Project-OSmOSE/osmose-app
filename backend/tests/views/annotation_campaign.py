"""Annotation campaign DRF-Viewset test file"""

from freezegun import freeze_time
from django.urls import reverse
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationCampaign,
    AnnotationTask,
    Dataset,
)
from backend.api.serializers.annotation.campaign.read import (
    AnnotationCampaignListFields,
)


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


@freeze_time("2012-01-14 00:00:00", tz_offset=-4)
class AnnotationCampaignViewSetTestCase(APITestCase):
    """Test AnnotationCampaignViewSet when request is authenticated"""

    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]
    creation_data = {
        "name": "string",
        "desc": "string",
        "instructions_url": "string",
        "deadline": "2022-01-30T10:42:15Z",
        "label_set": 1,
        "confidence_indicator_set": 1,
        "datasets": [1],
        "spectro_configs": [1],
        "annotators": [1, 2],
        "annotation_method": 1,
        "annotation_goal": 1,
        "annotation_scope": 1,
        "created_at": "2012-01-14T00:00:00Z",
        "usage": "Create",
    }
    check_creation_data = {
        "name": "string",
        "desc": "string",
        "instructions_url": "string",
        "deadline": "2022-01-30T10:42:15Z",
        "label_set": 1,
        "confidence_indicator_set": 1,
        "datasets": [1],
        "spectro_configs": [1],
        "annotators": [1],
        "annotation_goal": 1,
        "annotation_scope": 2,
        "created_at": "2012-01-14T00:00:00Z",
        "usage": "Check",
        "label_set_labels": ["click"],
        "confidence_set_indicators": [],
        "detectors": [{"detectorName": "nninni", "configuration": "test"}],
        "results": [
            {  # Weak annotation on a specific file
                "is_box": False,
                "dataset": "SPM Aural A 2010",
                "dataset_file": "sound001.wav",
                "detector": "nninni",
                "detector_config": "test",
                "start_datetime": "2012-10-03T10:00:00+00:00",
                "end_datetime": "2012-10-03T10:15:00+00:00",
                "min_time": 0,
                "max_time": 0,
                "min_frequency": 0,
                "max_frequency": 64000,
                "label": "click",
            },
            {  # Weak annotation on 2 files
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
            },
            {  # Strong annotation on a specific file
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
            },
            {  # Strong annotation on 2 files
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
            },
        ],
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

    def test_list_user_is_staff(self):
        """AnnotationCampaign view 'list' returns list of campaigns"""
        url = reverse("annotation-campaign-list")
        self.client.login(username="admin", password="osmose29")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(
            list(response.data[0].keys()),
            AnnotationCampaignListFields,
        )
        print(">>>", response.data)

        self.assertEqual(response.data[0]["name"], "Test DCLDE LF campaign")
        self.assertEqual(response.data[1]["name"], "Test SPM campaign")

    def test_list_user_no_campaign(self):
        """AnnotationCampaign view 'list' returns list of campaigns"""
        url = reverse("annotation-campaign-list")
        self.client.login(username="user4", password="osmose29")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_user_two_campaign(self):
        """AnnotationCampaign view 'list' returns list of campaigns"""
        url = reverse("annotation-campaign-list")
        self.client.login(username="user2", password="osmose29")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(
            list(response.data[0].keys()),
            AnnotationCampaignListFields,
        )
        self.assertEqual(response.data[0]["name"], "Test SPM campaign")
        self.assertEqual(response.data[1]["name"], "Test DCLDE LF campaign")
        self.assertEqual(response.data[1]["my_total"], 1)

    # Testing 'retrieve'

    def test_retrieve(self):
        """AnnotationCampaign view 'retrieve' returns campaign details"""
        url = reverse("annotation-campaign-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(response.data.keys()),
            [
                "campaign",
                "tasks",
                "is_campaign_owner",
                "spectro_configs",
                "audio_metadata",
            ],
        )
        self.assertEqual(
            list(response.data["campaign"].keys()),
            [
                "id",
                "name",
                "desc",
                "archive",
                "instructions_url",
                "deadline",
                "label_set",
                "confidence_indicator_set",
                "datasets_name",
                "created_at",
                "usage",
                "dataset_files_count",
            ],
        )

        self.assertEqual(response.data["campaign"]["name"], "Test SPM campaign")
        self.assertEqual(len(response.data["tasks"]), 2)
        self.assertEqual(
            dict(response.data["tasks"][0]),
            {"annotator_id": 1, "count": 6, "status": 0},
        )
        self.assertEqual(response.data["is_campaign_owner"], True)

    def test_retrieve_for_unknown_campaign(self):
        """AnnotationCampaign view 'retrieve' returns 404 for unknown campaign"""
        url = reverse("annotation-campaign-detail", kwargs={"pk": 42})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Testing 'create'
    def test_create(self):
        """AnnotationCampaign view 'create' adds new campaign to DB and returns campaign info"""
        self.maxDiff = None  # this is to avoid diff truncation in test error log
        old_count = AnnotationCampaign.objects.count()
        old_tasks_count = AnnotationTask.objects.count()
        url = reverse("annotation-campaign-list")
        response = self.client.post(url, self.creation_data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)
        self.assertEqual(AnnotationTask.objects.count(), old_tasks_count + 11)
        expected_response = {
            key: self.creation_data[key]
            for key in [
                "name",
                "desc",
                "instructions_url",
                "deadline",
                "created_at",
            ]
        }

        expected_response["id"] = AnnotationCampaign.objects.latest("id").id
        expected_response["datasets_name"] = ["SPM Aural A 2010"]
        response_data = dict(response.data)

        confidence_indicator_set = response_data.pop("confidence_indicator_set")
        self.assertEqual(confidence_indicator_set["name"], "Confidence/NoConfidence")
        self.assertEqual(confidence_indicator_set["desc"], "Lorem ipsum")
        self.assertEqual(len(confidence_indicator_set["confidence_indicators"]), 2)

        label_set = response_data.pop("label_set")
        self.assertEqual(label_set["name"], "Test SPM campaign")
        self.assertEqual(label_set["desc"], "Label set made for Test SPM campaign")
        self.assertEqual(len(label_set["labels"]), 5)
        expected_response["usage"] = "Create"
        expected_response["dataset_files_count"] = Dataset.objects.get(
            pk=self.creation_data["datasets"][0]
        ).files.count()
        expected_response["archive"] = None
        self.assertEqual(response_data, expected_response)

    def test_create_check(self):
        """AnnotationCampaign view 'create' adds new campaign to DB and returns campaign info"""
        self.maxDiff = None  # this is to avoid diff truncation in test error log
        old_count = AnnotationCampaign.objects.count()
        old_tasks_count = AnnotationTask.objects.count()
        url = reverse("annotation-campaign-list")
        response = self.client.post(url, self.check_creation_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)
        self.assertEqual(AnnotationTask.objects.count(), old_tasks_count + 11)
        expected_response = {
            key: self.creation_data[key]
            for key in [
                "name",
                "desc",
                "instructions_url",
                "deadline",
                "datasets",
                "created_at",
            ]
        }

        expected_response["id"] = AnnotationCampaign.objects.latest("id").id
        response_data = dict(response.data)

        self.assertEqual(response_data.pop("id"), expected_response["id"])
        self.assertEqual(response_data.pop("confidence_indicator_set"), None)

        label_set = response_data.pop("label_set")
        self.assertEqual(len(label_set["labels"]), 1)
        expected_response["usage"] = 1

        campaign: AnnotationCampaign = AnnotationCampaign.objects.get(
            pk=expected_response["id"]
        )
        self.assertEqual(campaign.results.all().count(), 6)

        # Result n°0 == Weak annotation on a specific file
        self.assertEqual(campaign.results.all()[0].start_time, None)
        self.assertEqual(campaign.results.all()[0].end_time, None)
        self.assertEqual(campaign.results.all()[0].start_frequency, None)
        self.assertEqual(campaign.results.all()[0].end_frequency, None)
        self.assertEqual(campaign.results.all()[0].dataset_file.id, 1)

        # Result n°1 == Weak annotation on 2 files | part 1
        self.assertEqual(campaign.results.all()[1].start_time, 0)
        self.assertEqual(campaign.results.all()[1].end_time, 15 * 60)
        self.assertEqual(campaign.results.all()[1].start_frequency, 0)
        self.assertEqual(campaign.results.all()[1].end_frequency, 64000)
        self.assertEqual(campaign.results.all()[1].dataset_file.id, 1)

        # Result n°2 == Weak annotation on 2 files | part 2
        self.assertEqual(campaign.results.all()[2].start_time, 0)
        self.assertEqual(campaign.results.all()[2].end_time, 10 * 60)
        self.assertEqual(campaign.results.all()[2].start_frequency, 0)
        self.assertEqual(campaign.results.all()[2].end_frequency, 64000)
        self.assertEqual(campaign.results.all()[2].dataset_file.id, 2)

        # Result n°3 == Strong annotation on a specific file
        self.assertEqual(campaign.results.all()[3].start_time, 0.8)
        self.assertEqual(campaign.results.all()[3].end_time, 1.8)
        self.assertEqual(campaign.results.all()[3].start_frequency, 32416)
        self.assertEqual(campaign.results.all()[3].end_frequency, 53916)
        self.assertEqual(campaign.results.all()[3].dataset_file.id, 1)

        # Result n°4 == Strong annotation on 2 files | part 1
        self.assertEqual(campaign.results.all()[4].start_time, 0.8)
        self.assertEqual(campaign.results.all()[4].end_time, 15 * 60)
        self.assertEqual(campaign.results.all()[4].start_frequency, 32416)
        self.assertEqual(campaign.results.all()[4].end_frequency, 53916)
        self.assertEqual(campaign.results.all()[4].dataset_file.id, 1)

        # Result n°51 == Strong annotation on 2 files | part 2
        self.assertEqual(campaign.results.all()[5].start_time, 0)
        self.assertEqual(campaign.results.all()[5].end_time, 8)
        self.assertEqual(campaign.results.all()[5].start_frequency, 32416)
        self.assertEqual(campaign.results.all()[5].end_frequency, 53916)
        self.assertEqual(campaign.results.all()[5].dataset_file.id, 2)

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
                "confidence_indicator_label",
                "confidence_indicator_level",
                "comments",
            ],
        )
        self.assertEqual(
            response.data[1],
            [  # annotationresult id=7 ; because ordered by dataset_file and not id
                "SPM Aural A 2010",
                "sound001.wav",
                "108.21842250413678",
                "224.87589630446772",
                "7520.0",
                "13696.0",
                "Odoncetes",
                "admin",
                "2012-10-03T10:01:48.218+00:00",
                "2012-10-03T10:03:44.875+00:00",
                "1",
                "confident",
                "0/1",
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
