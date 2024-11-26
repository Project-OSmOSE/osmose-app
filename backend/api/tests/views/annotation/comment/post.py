"""Test AnnotationCommentViewSet"""
# pylint: disable=missing-class-docstring, missing-function-docstring, duplicate-code
import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import (
    AnnotationComment,
)
from backend.utils.tests import AuthenticatedTestCase, all_fixtures

URL = reverse(
    "annotation-comment-campaign-file-global", kwargs={"campaign_id": 1, "file_id": 9}
)
URL_unknown_campaign = reverse(
    "annotation-comment-campaign-file-global", kwargs={"campaign_id": 27, "file_id": 1}
)
URL_unknown_file = reverse(
    "annotation-comment-campaign-file-global", kwargs={"campaign_id": 1, "file_id": 27}
)

create = [
    {
        "comment": "Test A",
    }
]

update = [
    {
        "comment": "Test B",
    }
]


class PostUnauthenticatedTestCase(APITestCase):
    """Test AnnotationFileRangeViewSet when request is unauthenticated"""

    def test_unauthenticated(self):
        """ViewSet returns 401 if no user is authenticated"""
        response = self.client.post(
            URL,
            data=json.dumps(create),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostBaseUserAuthenticatedTestCase(AuthenticatedTestCase):
    username = "user3"
    fixtures = all_fixtures

    def test_post_unknown_campaign(self):
        response = self.client.post(
            URL_unknown_campaign,
            data=json.dumps(create),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_unknown_file(self):
        response = self.client.post(
            URL_unknown_file,
            data=json.dumps(create),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_post(self):
        response = self.client.post(
            URL,
            data=json.dumps(create),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PostAnnotatorAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user2"

    def test_empty_post(self):
        old_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(create),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationComment.objects.count(), old_count + 1)

        comment = AnnotationComment.objects.latest("id")
        self.assertEqual(response.data[0]["id"], comment.id)
        self.assertEqual(response.data[0]["dataset_file"], 9)
        self.assertEqual(response.data[0]["comment"], "Test A")
        self.assertEqual(response.data[0]["annotation_result"], None)
        self.assertEqual(response.data[0]["author"], 4)
        self.assertEqual(response.data[0]["annotation_campaign"], 1)

    def test_empty_post_update(self):
        self.test_empty_post()
        old_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps(update),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationComment.objects.count(), old_count)

        comment = AnnotationComment.objects.latest("id")
        self.assertEqual(response.data[0]["id"], comment.id)
        self.assertEqual(response.data[0]["dataset_file"], 9)
        self.assertEqual(response.data[0]["comment"], "Test B")
        self.assertEqual(response.data[0]["annotation_result"], None)
        self.assertEqual(response.data[0]["author"], 4)
        self.assertEqual(response.data[0]["annotation_campaign"], 1)

    def test_empty_post_delete(self):
        self.test_empty_post()
        old_count = AnnotationComment.objects.count()
        response = self.client.post(
            URL,
            data=json.dumps([]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AnnotationComment.objects.count(), old_count - 1)


class PostCampaignOwnerAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "user1"
    # Campaign owner does not have file range on campaign, so it should be
    # associated as a base user on post results permissions


class PostAdminAuthenticatedTestCase(PostBaseUserAuthenticatedTestCase):
    username = "admin"
    # Admin file range does not include files 7 and 9 on campaign, so it should
    # be associated as a base user on post results permissions
