"""Annotation task DRF-Viewset test file"""

from copy import deepcopy

from django.test import TestCase

from backend.api.serializers import AnnotationTaskUpdateSerializer
from backend.api.models import AnnotationTask


class AnnotationTaskUpdateSerializerTestCase(TestCase):
    """Test AnnotationTaskUpdateSerializer which updates a task with new results"""

    fixtures = [
        "users",
        "datasets",
        "annotation_sets",
        "annotation_campaigns_tasks",
        "annotation_results_sessions",
    ]
    update_data = {
        "annotations": [
            {
                "annotation": "Boat",
                "startTime": 10,
                "endTime": 50,
                "startFrequency": 100,
                "endFrequency": 200,
                "result_comments": None,
            }
        ],
        "task_start_time": 10,
        "task_end_time": 60,
    }

    def test_with_valid_data(self):
        """Updates correctly the DB when serializer saves with correct data"""
        task = AnnotationTask.objects.first()
        self.assertEqual(task.status, 0)
        self.assertEqual(task.results.count(), 3)
        update_serializer = AnnotationTaskUpdateSerializer(task, data=self.update_data)
        update_serializer.is_valid(raise_exception=True)
        update_serializer.save()
        task.refresh_from_db()
        self.assertEqual(task.status, 2)
        self.assertEqual(task.results.count(), 1)

    def test_with_unknown_tags(self):
        """Fails validation when given an unknown tag with correct message"""
        task = AnnotationTask.objects.first()
        update_data = deepcopy(self.update_data)
        update_data["annotations"][0]["annotation"] = "Unknown"
        update_serializer = AnnotationTaskUpdateSerializer(task, data=update_data)
        self.assertFalse(update_serializer.is_valid())
        self.assertEquals(list(update_serializer.errors.keys()), ["annotations"])
        self.assertEquals(len(update_serializer.errors["annotations"]), 1)
        self.assertIn(
            "{'Unknown'} not valid tags from annotation set",
            str(update_serializer.errors["annotations"][0]),
        )
