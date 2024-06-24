"""Annotation task DRF-Viewset test file"""

from copy import deepcopy

from django.test import TestCase

from backend.api.models import AnnotationTask, AnnotationResult
from backend.api.serializers import AnnotationTaskUpdateSerializer


class AnnotationTaskUpdateSerializerTestCase(TestCase):
    """Test AnnotationTaskUpdateSerializer which updates a task with new results"""

    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]
    update_data = {
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
    }

    def test_with_valid_data(self):
        """Updates correctly the DB when serializer saves with correct data"""
        task = AnnotationTask.objects.first()  # type: AnnotationTask
        self.assertEqual(task.status, 0)
        results_count = AnnotationResult.objects.filter(
            annotation_campaign_id=task.annotation_campaign_id,
            dataset_file_id=task.dataset_file_id,
            annotator_id=task.annotator_id,
        ).count()
        self.assertEqual(results_count, 3)
        update_serializer = AnnotationTaskUpdateSerializer(task, data=self.update_data)
        update_serializer.is_valid(raise_exception=True)
        update_serializer.save()
        task.refresh_from_db()
        results_count = AnnotationResult.objects.filter(
            annotation_campaign_id=task.annotation_campaign_id,
            dataset_file_id=task.dataset_file_id,
            annotator_id=task.annotator_id,
        ).count()
        self.assertEqual(task.status, 2)
        self.assertEqual(results_count, 1)

    def test_with_unknown_labels(self):
        """Fails validation when given an unknown label with correct message"""
        task = AnnotationTask.objects.first()
        update_data = deepcopy(self.update_data)
        update_data["annotations"][0]["label"] = "Unknown"
        update_data["id"] = task.id
        update_serializer = AnnotationTaskUpdateSerializer(task, data=update_data)
        self.assertFalse(update_serializer.is_valid())
        self.assertEqual(list(update_serializer.errors.keys()), ["annotations"])
        self.assertEqual(len(update_serializer.errors["annotations"]), 1)
        self.assertIn(
            "{'Unknown'} not valid labels from label set",
            str(update_serializer.errors["annotations"][0]),
        )
