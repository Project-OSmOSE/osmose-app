"""Tests for SQL ViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.utils.tests import AuthenticatedTestCase

URL = reverse("sql-post")
SELECT_DATA = {"query": "SELECT * FROM api_label"}
DROP_DATA = {"query": "DROP TABLE api_label"}
INSERT_DATA = {"query": "INSERT INTO api_label (name) VALUES ('test')"}
UPDATE_DATA = {"query": "UPDATE api_label SET name='test'"}


class SqlViewSetUnauthenticatedTestCase(APITestCase):
    fixtures = ["users", "label_set", "label"]

    def test_post(self):
        response = self.client.post(URL, SELECT_DATA)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SqlViewSetBaseUserTestCase(AuthenticatedTestCase):
    username = "user1"
    fixtures = ["users", "label_set", "label"]

    def test_post(self):
        response = self.client.post(URL, SELECT_DATA)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SqlViewSetStaffUserTestCase(SqlViewSetBaseUserTestCase):
    username = "staff"


class SqlViewSetSuperuserUserTestCase(AuthenticatedTestCase):

    username = "admin"
    fixtures = ["users", "label_set", "label"]

    def test_post(self):
        response = self.client.post(URL, SELECT_DATA)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 7)
        self.assertEqual(len(response.data["results"]), 7)

    def test_post_drop(self):
        response = self.client.post(URL, DROP_DATA)
        self.assertEqual(response.status_code, status.HTTP_406_NOT_ACCEPTABLE)

    def test_post_insert(self):
        response = self.client.post(URL, INSERT_DATA)
        self.assertEqual(response.status_code, status.HTTP_406_NOT_ACCEPTABLE)

    def test_post_update(self):
        response = self.client.post(URL, UPDATE_DATA)
        self.assertEqual(response.status_code, status.HTTP_406_NOT_ACCEPTABLE)
