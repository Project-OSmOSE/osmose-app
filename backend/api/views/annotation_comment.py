"""Annotation campaign DRF-Viewset file"""

from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework import viewsets
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema

from backend.api.models import (
    AnnotationComment,
)
from backend.api.serializers import (
    AnnotationCommentRetrieveSerializer,
    AnnotationCommentCreateSerializer,
)


class AnnotationCommentViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation comment related actions
    """

    queryset = AnnotationComment.objects.all()
    serializer_class = AnnotationCommentRetrieveSerializer

    def list(self, request):
        """List available datasets"""
        queryset = AnnotationComment.objects.all()

        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)

    @extend_schema(responses=AnnotationCommentRetrieveSerializer)
    def retrieve(self, request, pk=None):
        """Show a specific annotation comments"""
        annotation_comments = get_object_or_404(self.queryset, pk=pk)
        serializer = AnnotationCommentRetrieveSerializer(annotation_comments)
        return Response(serializer.data)

    @transaction.atomic
    @extend_schema(
        request=AnnotationCommentCreateSerializer,
        responses=AnnotationCommentRetrieveSerializer,
    )
    def create(self, request):
        """Create a new annotation comments"""
        create_serializer = AnnotationCommentCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        campaign = create_serializer.save()
        serializer = AnnotationCommentRetrieveSerializer(campaign)
        return Response(serializer.data)

    @transaction.atomic
    @extend_schema(
        request=AnnotationCommentCreateSerializer,
        responses=AnnotationCommentRetrieveSerializer,
    )
    def update(self, request, pk):
        """Update a new annotation comments"""
        queryset = AnnotationComment.objects.all()
        comment = get_object_or_404(queryset, pk=pk)
        print(request.data["comment"])
        if request.data["comment"] == "":
            comment.delete()
            return Response({"delete": str(request.data["comment_id"])})
        create_serializer = AnnotationCommentCreateSerializer(
            comment, data=request.data
        )
        create_serializer.is_valid(raise_exception=True)
        campaign = create_serializer.save()
        serializer = AnnotationCommentRetrieveSerializer(campaign)
        return Response(serializer.data)
