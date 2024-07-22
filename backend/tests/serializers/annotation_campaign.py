"""Annotation campaign DRF serializers test file"""

from django.test import TestCase
from django.contrib.auth.models import User

from copy import deepcopy

from backend.api.serializers import (
    AnnotationCampaignAddAnnotatorsSerializer,
    AnnotationCampaignCreateCreateAnnotationsSerializer,
)
from backend.api.models import AnnotationCampaign, AnnotationTask


class AnnotationCampaignCreateSerializerTestCase(TestCase):
    """Test AnnotationCampaignCreateSerializer which creates a new campaign"""

    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]
    creation_data = {
        "name": "campaign name",
        "desc": "description",
        "instructions_url": "https://instructions.org",
        "start": "2022-01-25T10:42:15Z",
        "end": "2022-01-30T10:42:15Z",
        "label_set": 1,
        "confidence_indicator_set_id": 1,
        "datasets": [1],
        "annotators": [1, 2],
        "annotation_method": 1,
        "annotation_goal": 1,
        "annotation_scope": 1,
        "spectro_configs": [1],
        "usage": "Create",
    }

    def test_with_valid_data(self):
        """Updates correctly the DB when serializer saves with correct data"""
        old_count = AnnotationCampaign.objects.count()
        old_tasks_count = AnnotationTask.objects.count()

        create_serializer = AnnotationCampaignCreateCreateAnnotationsSerializer(
            data=self.creation_data
        )
        create_serializer.is_valid(raise_exception=True)
        create_serializer.save(owner_id=1)
        self.assertEqual(AnnotationCampaign.objects.count(), old_count + 1)
        self.assertEqual(AnnotationTask.objects.count(), old_tasks_count + 11)
        new_campaign = AnnotationCampaign.objects.latest("id")
        self.assertEqual(new_campaign.name, self.creation_data["name"])
        self.assertEqual(new_campaign.owner_id, 1)
        self.assertEqual(new_campaign.tasks.count(), 11)

    def test_with_wrong_spectros(self):
        """Fails validation when given a SpectrogramConfiguration not used in campaign"""
        campaign = AnnotationCampaign.objects.first()
        update_data = deepcopy(self.creation_data)
        update_data["spectro_configs"] = [3]

        create_serializer = AnnotationCampaignCreateCreateAnnotationsSerializer(
            campaign, data=update_data
        )
        self.assertFalse(create_serializer.is_valid())
        self.assertEqual(list(create_serializer.errors.keys()), ["spectro_configs"])
        self.assertEqual(
            str(create_serializer.errors["spectro_configs"][0]),
            "['spectro_config2 - Another Dataset'] not valid ids for spectro configs of given datasets (['SPM Aural A 2010'])",
        )


class AnnotationCampaignAddAnnotatorsSerializerTestCase(TestCase):
    """Test AnnotationCampaignAddAnnotatorsSerializer which creates tasks for new annotators on given campaign"""

    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]
    add_annotators_data = {
        "annotators": [3],
        "annotation_method": 1,
        "annotation_goal": 5,
    }

    def test_with_valid_data(self):
        """Updates correctly the DB when serializer saves with correct data"""
        files_target = self.add_annotators_data["annotation_goal"]
        new_annotator = User.objects.get(id=self.add_annotators_data["annotators"][0])
        old_user_count = new_annotator.annotation_tasks.count()
        campaign = AnnotationCampaign.objects.first()
        old_tasks_count = campaign.tasks.count()

        update_serializer = AnnotationCampaignAddAnnotatorsSerializer(
            campaign, data=self.add_annotators_data
        )
        update_serializer.is_valid(raise_exception=True)
        update_serializer.save()
        campaign.refresh_from_db()
        self.assertEqual(
            new_annotator.annotation_tasks.count(), old_user_count + files_target
        )
        self.assertEqual(campaign.tasks.count(), old_tasks_count + files_target)

    def test_without_annotation_goal(self):
        """Fails validation when given an unknown label with correct message"""
        add_annotators_data = deepcopy(self.add_annotators_data)
        add_annotators_data.pop("annotation_goal")
        campaign = AnnotationCampaign.objects.first()

        update_serializer = AnnotationCampaignAddAnnotatorsSerializer(
            campaign, data=add_annotators_data
        )
        self.assertFalse(update_serializer.is_valid())
        self.assertEqual(list(update_serializer.errors.keys()), ["annotation_goal"])
