"""Test AnnotationCampaignViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APITestCase

from backend.api.tests.utils import AuthenticatedTestCase, empty_fixtures, all_fixtures
from backend.api.views.annotation.campaign import REPORT_HEADERS

URL = reverse("annotation-campaign-report", kwargs={"pk": 1})
URL_status = reverse("annotation-campaign-report-status", kwargs={"pk": 1})


def check_report(test: APITestCase, response: Response):
    test.assertEqual(response.status_code, status.HTTP_200_OK)
    test.assertEqual(len(response.data), 10)
    test.assertEqual(response.data[0], REPORT_HEADERS)
    test.assertEqual(
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


def check_report_status(test: APITestCase, response: Response):
    test.assertEqual(response.status_code, status.HTTP_200_OK)
    test.assertEqual(len(response.data), 12)
    test.assertEqual(response.data[0], ["dataset", "filename", "admin", "user2"])
    test.assertEqual(
        response.data[1],
        ["SPM Aural A 2010", "sound001.wav", "CREATED", "UNASSIGNED"],
    )


class ReportUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_report(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_report_status(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL_status)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReportEmpyAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = empty_fixtures

    def test_report(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_report_status(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.get(URL_status)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ReportFilledAdminAuthenticatedTestCase(AuthenticatedTestCase):
    username = "admin"
    fixtures = all_fixtures

    def test_report(self):
        response = self.client.get(URL)
        check_report(self, response)

    def test_report_status(self):
        response = self.client.get(URL_status)
        check_report_status(self, response)


class ReportFilledCampaignOwnerAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user1"
    fixtures = all_fixtures

    def test_report(self):
        response = self.client.get(URL)
        check_report(self, response)

    def test_report_status(self):
        response = self.client.get(URL_status)
        check_report_status(self, response)


class ReportFilledBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user2"
    fixtures = all_fixtures

    def test_report(self):
        response = self.client.get(URL)
        check_report(self, response)

    def test_report_status(self):
        response = self.client.get(URL_status)
        check_report_status(self, response)


class ReportFilledBaseUserNoCampaignAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user4"
    fixtures = all_fixtures

    def test_report(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_report_status(self):
        response = self.client.get(URL_status)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
