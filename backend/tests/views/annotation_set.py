"""AnnotationSet DRF-Viewset test file"""

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from backend.api.models import AnnotationSet


class AnnotationSetViewSetUnauthenticatedTestCase(APITestCase):
    """Test AnnotationSet when request is unauthenticated"""

    def test_list_unauthenticated(self):
        """AnnotationSet view 'list' returns 401 if no user is authenticated"""
        url = reverse('annotation-set-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AnnotationSetViewSetTestCase(APITestCase):
    """Test AnnotationSet when request is authenticated"""

    fixtures = ['users', 'annotation_sets']

    def setUp(self):
        self.client.login(username='user1', password='osmose29')

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        """AnnotationSet view 'list' returns correct list of annotation sets"""
        url = reverse('annotation-set-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), AnnotationSet.objects.count())
        self.assertEqual(list(response.data[0].keys()), ['id', 'name', 'desc', 'tags'])
        self.assertEqual(response.data[0]['name'], 'Test SPM campaign')
        self.assertEqual(response.data[0]['tags'], ['Mysticetes', 'Odoncetes', 'Boat', 'Rain', 'Other'])
