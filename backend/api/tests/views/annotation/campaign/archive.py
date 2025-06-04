"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring

from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationCampaign,
    AnnotationCampaignArchive,
)
from backend.utils.tests import all_fixtures, AuthenticatedTestCase

URL = reverse("annotation-campaign-archive", kwargs={"pk": 1})
URL_unknown = reverse("annotation-campaign-archive", kwargs={"pk": 186})


class ArchiveUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    fixtures = all_fixtures

    def test_archive(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@freeze_time("2012-01-14 00:00:00")
class ArchiveAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test_archive(self):
        campaign = AnnotationCampaign.objects.get(pk=1)

        for phase in campaign.phases.all():
            self.assertEqual(phase.is_open, True)
            self.assertIsNone(phase.ended_at)
            self.assertIsNone(phase.ended_by_id)

        old_count = AnnotationCampaignArchive.objects.count()
        response = self.client.post(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationCampaignArchive.objects.count(), old_count + 1)

        campaign = AnnotationCampaign.objects.get(pk=1)
        self.assertIsNotNone(campaign.archive)
        self.assertEqual(campaign.archive.by_user.username, self.username)

        for phase in campaign.phases.all():
            self.assertFalse(phase.is_open)
            self.assertEqual(phase.ended_at.isoformat(), "2012-01-14T00:00:00+00:00")
            self.assertEqual(phase.ended_by_id, campaign.archive.by_user_id)

    def test_archive_unknown(self):
        old_count = AnnotationCampaignArchive.objects.count()
        response = self.client.post(URL_unknown, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(AnnotationCampaignArchive.objects.count(), old_count)


class ArchiveOwnerAuthenticatedTestCase(ArchiveAdminAuthenticatedTestCase):
    username = "user1"


class ArchiveAnnotatorAuthenticatedTestCase(ArchiveAdminAuthenticatedTestCase):
    username = "user2"

    def test_archive(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ArchiveBaseUserAuthenticatedTestCase(ArchiveAnnotatorAuthenticatedTestCase):
    username = "user4"

    def test_archive(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
