# pylint: disable=missing-module-docstring, missing-class-docstring, missing-function-docstring
from django.test import TestCase

from backend.api.models import AnnotationTask, AnnotationFileRange
from backend.utils.tests import all_fixtures


class AnnotationFileRangeTestCase(TestCase):
    fixtures = all_fixtures

    def test_update_delete_unrelated_tasks(self):
        file_range = AnnotationFileRange.objects.get(pk=1)
        self.assertEqual(AnnotationTask.objects.count(), 13)
        self.assertEqual(AnnotationFileRange.objects.count(), 6)

        file_range.last_file_index -= 1
        file_range.save()

        self.assertEqual(AnnotationFileRange.objects.count(), 6)
        self.assertEqual(AnnotationTask.objects.count(), 12)

    def test_delete_also_delete_tasks(self):
        self.assertEqual(AnnotationFileRange.objects.count(), 6)
        self.assertEqual(AnnotationTask.objects.count(), 13)
        AnnotationFileRange.objects.get(pk=1).delete()
        self.assertEqual(AnnotationFileRange.objects.count(), 5)
        self.assertEqual(AnnotationTask.objects.count(), 7)

    def test_delete_also_delete_tasks_except_overlapping(self):
        file_range = AnnotationFileRange.objects.get(pk=1)
        self.assertEqual(AnnotationTask.objects.count(), 13)
        self.assertEqual(AnnotationFileRange.objects.count(), 6)

        AnnotationFileRange.objects.create(
            first_file_index=file_range.first_file_index,
            last_file_index=file_range.last_file_index,
            from_datetime=file_range.from_datetime,
            to_datetime=file_range.to_datetime,
            annotation_phase_id=file_range.annotation_phase_id,
            annotator_id=file_range.annotator_id,
        )
        self.assertEqual(AnnotationFileRange.objects.count(), 7)
        file_range.delete()
        self.assertEqual(AnnotationFileRange.objects.count(), 6)
        self.assertEqual(AnnotationTask.objects.count(), 13)
