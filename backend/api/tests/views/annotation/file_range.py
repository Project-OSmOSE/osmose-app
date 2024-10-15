import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationFileRange,
    AnnotationCampaign,
)


class AnnotationFileRangeBaseTestCase(APITestCase):

    fixtures = [
        "users",
        "datasets",
        "label_sets",
        "confidence_indicator_sets",
        "file_range_test",
    ]

    def setUp(self):
        """Login when tests starts"""
        self.client.login(username="admin", password="osmose29")

    def tearDown(self):
        """Logout when tests ends"""
        self.client.logout()

    def test_create_one_range(self):
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        "first_file_index": 2,
                        "last_file_index": 7,
                        "annotator": 1,
                        "annotation_campaign": 1,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationFileRange.objects.count(), initial_count + 1)


class AnnotationFileRangeListTestCase(AnnotationFileRangeBaseTestCase):
    def test_list_empty(self):
        url = reverse("annotation-file-range-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), AnnotationFileRange.objects.count())

    def test_list_not_empty(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), AnnotationFileRange.objects.count())


class AnnotationFileRangeCreateTestCase(AnnotationFileRangeBaseTestCase):
    def test_create_duplicated_range(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        "first_file_index": 2,
                        "last_file_index": 7,
                        "annotator": 1,
                        "annotation_campaign": 1,
                    },
                ]
            ),
            content_type="application/json",
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_bellow_range(self):
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        "first_file_index": -2,
                        "last_file_index": -1,
                        "annotator": 1,
                        "annotation_campaign": 1,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("first_file_index")[0].code, "min_value")
        self.assertEqual(response.data.get("last_file_index")[0].code, "min_value")

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_over_range(self):
        url = reverse("annotation-file-range-many")
        campaign_files_count = (
            AnnotationCampaign.objects.get(pk=1).get_sorted_files().count()
        )
        initial_count = AnnotationFileRange.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        "first_file_index": campaign_files_count + 1,
                        "last_file_index": campaign_files_count + 2,
                        "annotator": 1,
                        "annotation_campaign": 1,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("first_file_index")[0].code, "max_value")
        self.assertEqual(response.data.get("last_file_index")[0].code, "max_value")

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_wrong_range_limits_order(self):
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        response = self.client.post(
            url,
            data=json.dumps(
                [
                    {
                        "first_file_index": 3,
                        "last_file_index": 1,
                        "annotator": 1,
                        "annotation_campaign": 1,
                    }
                ]
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("non_field_errors")[0].code, "value_order")

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_overlapping_within_order(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        initial_range = AnnotationFileRange.objects.first()
        new_range = {
            "first_file_index": 3,
            "last_file_index": 5,
            "annotator": 1,
            "annotation_campaign": 1,
        }
        response = self.client.post(
            url,
            data=json.dumps([new_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]["first_file_index"], initial_range.first_file_index
        )
        self.assertEqual(
            response.data[0]["last_file_index"], initial_range.last_file_index
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_overlapping_extra_order(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")

        initial_count = AnnotationFileRange.objects.count()
        new_range = {
            "first_file_index": 1,
            "last_file_index": 9,
            "annotator": 1,
            "annotation_campaign": 1,
        }

        response = self.client.post(
            url,
            data=json.dumps([new_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]["first_file_index"], new_range["first_file_index"]
        )
        self.assertEqual(
            response.data[0]["last_file_index"], new_range["last_file_index"]
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_sibling_order(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")

        initial_count = AnnotationFileRange.objects.count()
        initial_range = AnnotationFileRange.objects.first()
        new_range = {
            "first_file_index": 8,
            "last_file_index": 9,
            "annotator": 1,
            "annotation_campaign": 1,
        }

        response = self.client.post(
            url,
            data=json.dumps([new_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]["first_file_index"], initial_range.first_file_index
        )
        self.assertEqual(
            response.data[0]["last_file_index"], new_range["last_file_index"]
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_create_overlapping_multiple_order(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")

        initial_count = AnnotationFileRange.objects.count()
        initial_range = AnnotationFileRange.objects.first()
        new_range_1 = {
            "first_file_index": 9,
            "last_file_index": 10,
            "annotator": 1,
            "annotation_campaign": 1,
        }
        new_range_2 = {
            "first_file_index": 5,
            "last_file_index": 9,
            "annotator": 1,
            "annotation_campaign": 1,
        }

        response = self.client.post(
            url,
            data=json.dumps([new_range_1, new_range_2]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]["first_file_index"], initial_range.first_file_index
        )
        self.assertEqual(
            response.data[0]["last_file_index"], new_range_1["last_file_index"]
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)


class AnnotationFileRangeUpdateTestCase(AnnotationFileRangeBaseTestCase):
    def test_update_range(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        initial_range = AnnotationFileRange.objects.first()
        updated_range = {
            "id": initial_range.id,
            "first_file_index": 3,
            "last_file_index": 5,
            "annotator": initial_range.annotator.id,
            "annotation_campaign": initial_range.annotation_campaign.id,
        }

        response = self.client.post(
            url,
            data=json.dumps([updated_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["id"], initial_range.id)
        self.assertEqual(
            response.data[0]["first_file_index"], updated_range["first_file_index"]
        )
        self.assertEqual(
            response.data[0]["last_file_index"], updated_range["last_file_index"]
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)

    def test_update_lowest_with_results_out_of_range(self):
        self.test_create_one_range()
        url = reverse("annotation-file-range-many")
        initial_count = AnnotationFileRange.objects.count()
        initial_range = AnnotationFileRange.objects.first()
        updated_range = {
            "id": initial_range.id,
            "first_file_index": 3,
            "last_file_index": 5,
            "annotator": initial_range.annotator.id,
            "annotation_campaign": initial_range.annotation_campaign.id,
        }

        response = self.client.post(
            url,
            data=json.dumps([updated_range]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["id"], initial_range.id)
        self.assertEqual(
            response.data[0]["first_file_index"], updated_range["first_file_index"]
        )
        self.assertEqual(
            response.data[0]["last_file_index"], updated_range["last_file_index"]
        )

        self.assertEqual(AnnotationFileRange.objects.count(), initial_count)
