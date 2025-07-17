"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring

from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APITestCase

from backend.utils.tests import all_fixtures, AuthenticatedTestCase

URL = reverse("annotation-campaign-detail", kwargs={"pk": 1})
URL_unknown = reverse("annotation-campaign-detail", kwargs={"pk": 186})


class PatchUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    fixtures = all_fixtures

    def test(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.patch(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@freeze_time("2012-01-14 00:00:00")
class PatchAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures
    maxDiff = None

    def test_empty(self):
        response_get = self.client.patch(URL, format="json")
        response_patch = self.client.patch(URL, format="json")
        self.assertEqual(response_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(response_patch.data, response_get.data)

    def test_label_set(self):
        response_get = self.client.patch(URL, format="json")
        response_patch = self.client.patch(URL, data={"label_set": 2}, format="json")
        self.assertEqual(response_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response_patch.data,
            {
                **response_get.data,
                "label_set": 2,
            },
        )

    def test_labels_with_acoustic_features(self):
        response_get = self.client.patch(URL, format="json")
        response_patch = self.client.patch(
            URL, data={"labels_with_acoustic_features": ["Rain"]}, format="json"
        )
        self.assertEqual(response_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response_patch.data,
            {
                **response_get.data,
                "labels_with_acoustic_features": ["Rain"],
            },
        )

    def test_confidence_indicator_set(self):
        response_get = self.client.patch(URL, format="json")
        response_patch = self.client.patch(
            URL, data={"confidence_indicator_set": None}, format="json"
        )
        self.assertEqual(response_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response_patch.data,
            {
                **response_get.data,
                "confidence_indicator_set": None,
            },
        )

    def test_allow_point_annotation(self):
        response_get = self.client.patch(URL, format="json")
        response_patch = self.client.patch(
            URL, data={"allow_point_annotation": True}, format="json"
        )
        self.assertEqual(response_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response_patch.data,
            {
                **response_get.data,
                "allow_point_annotation": True,
            },
        )


class PatchOwnerAuthenticatedTestCase(PatchAdminAuthenticatedTestCase):
    username = "user1"


class PatchAnnotatorAuthenticatedTestCase(PatchAdminAuthenticatedTestCase):
    username = "user2"

    def test_empty(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.patch(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_label_set(self):
        pass

    def test_labels_with_acoustic_features(self):
        pass

    def test_confidence_indicator_set(self):
        pass

    def test_allow_point_annotation(self):
        pass


class PatchBaseUserAuthenticatedTestCase(PatchAnnotatorAuthenticatedTestCase):
    username = "user4"

    def test_empty(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.patch(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
