"""Annotation campaign DRF-Viewset file"""

from datetime import timedelta

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Count, Prefetch, Q

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema, OpenApiExample

from backend.utils.renderers import CSVRenderer
from backend.api.models import (
    AnnotationCampaign,
    AnnotationComment,
    AnnotationTask,
    AnnotationResult,
)
from backend.api.serializers import (
    AnnotationCommentSerializer,
    AnnotationCommentCreateSerializer,
)


class AnnotationCommentViewSet(viewsets.ViewSet):
    queryset = AnnotationComment.objects.all()
    serializer_class = AnnotationCommentSerializer

    def list(self, request):
        """List available datasets"""
        queryset = AnnotationComment.objects.all()

        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)

    @extend_schema(responses=AnnotationCommentSerializer)
    def retrieve(self, request, pk=None):
        """Show a specific annotation comments"""
        annotation_comments = get_object_or_404(self.queryset, pk=pk)
        serializer = AnnotationCommentSerializer(annotation_comments)
        return Response(serializer.data)

    @transaction.atomic
    @extend_schema(
        request=AnnotationCommentCreateSerializer,
        responses=AnnotationCommentSerializer,
    )
    def create(self, request):
        """Create a new annotation comments"""
        queryset = AnnotationComment.objects.all()
        if request.data["comment_id"] == None:
            create_serializer = AnnotationCommentCreateSerializer(data=request.data)
        else:
            comment = get_object_or_404(queryset, pk=request.data["comment_id"])
            create_serializer = AnnotationCommentCreateSerializer(
                comment, data=request.data
            )

        create_serializer.is_valid(raise_exception=True)
        campaign = create_serializer.save()
        serializer = AnnotationCommentSerializer(campaign)
        return Response(serializer.data)
