# pylint: disable=missing-module-docstring, missing-class-docstring, missing-function-docstring, duplicate-code

from django.test import TestCase

from backend.api.models import (
    AnnotationComment,
    AnnotationCampaignPhase,
)
from backend.api.serializers import (
    AnnotationCommentSerializer,
)
from backend.utils.tests import all_fixtures

comment = {
    "comment": "Test A",
    "annotation_campaign_phase": 1,
    "dataset_file": 1,
    "author": 4,
    "annotation_result": 1,
}


class CreateTestCase(TestCase):
    fixtures = all_fixtures
    maxDiff = None  # See all differences on failed tests

    def _get_serializer(self, data):
        return AnnotationCommentSerializer(data=data)

    def test(self):
        serializer = self._get_serializer(comment)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        self.assertDictEqual(dict(serializer.data), comment)

    # Corrected

    # Errors
    def test_required(self):
        serializer = self._get_serializer({})
        self.assertFalse(serializer.is_valid(raise_exception=False))
        self.assertListEqual(
            list(serializer.errors.keys()),
            [
                "annotation_campaign_phase",
                "author",
                "dataset_file",
                "comment",
            ],
        )
        self.assertEqual(serializer.errors["author"][0].code, "required")
        self.assertEqual(serializer.errors["dataset_file"][0].code, "required")
        self.assertEqual(
            serializer.errors["annotation_campaign_phase"][0].code, "required"
        )
        self.assertEqual(serializer.errors["comment"][0].code, "required")

    def test_null(self):
        serializer = self._get_serializer(
            {
                "comment": None,
                "annotation_campaign_phase": None,
                "dataset_file": None,
                "author": None,
                "annotation_result": None,
            }
        )
        self.assertFalse(serializer.is_valid(raise_exception=False))
        self.assertListEqual(
            list(serializer.errors.keys()),
            [
                "annotation_campaign_phase",
                "author",
                "dataset_file",
                "comment",
            ],
        )
        self.assertEqual(serializer.errors["author"][0].code, "null")
        self.assertEqual(serializer.errors["dataset_file"][0].code, "null")
        self.assertEqual(serializer.errors["annotation_campaign_phase"][0].code, "null")
        self.assertEqual(serializer.errors["comment"][0].code, "null")

    def test_does_not_exist(self):
        serializer = self._get_serializer(
            {
                **comment,
                "annotation_campaign_phase": -1,
                "dataset_file": -1,
                "author": -1,
                "annotation_result": -1,
            }
        )
        self.assertFalse(serializer.is_valid(raise_exception=False))
        self.assertListEqual(
            list(serializer.errors.keys()),
            [
                "annotation_result",
                "annotation_campaign_phase",
                "author",
                "dataset_file",
            ],
        )
        self.assertEqual(serializer.errors["author"][0].code, "does_not_exist")
        self.assertEqual(serializer.errors["dataset_file"][0].code, "does_not_exist")
        self.assertEqual(
            serializer.errors["annotation_campaign_phase"][0].code, "does_not_exist"
        )
        self.assertEqual(
            serializer.errors["annotation_result"][0].code, "does_not_exist"
        )


class UpdateTestCase(CreateTestCase):
    fixtures = all_fixtures

    def setUp(self):
        phase = AnnotationCampaignPhase.objects.get(pk=1)
        self.instance = AnnotationComment.objects.create(
            annotation_campaign_phase=phase,
            dataset_file=phase.annotation_campaign.datasets.first().files.first(),
            author=phase.created_by,
            comment="Test",
        )

    def tearDown(self):
        self.instance.delete()

    def _get_serializer(self, data):
        return AnnotationCommentSerializer(
            instance=self.instance,
            data=data,
        )

    def test(self):
        serializer = self._get_serializer(comment)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        serializer.save()
        self.assertDictEqual(
            dict(serializer.data),
            {"id": self.instance.id, **comment},
        )
