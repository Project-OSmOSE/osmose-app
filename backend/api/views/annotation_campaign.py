"""Annotation campaign DRF-Viewset file"""

from datetime import timedelta

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Count, Q, Prefetch

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from drf_spectacular.utils import extend_schema, OpenApiExample

from backend.utils.renderers import CSVRenderer
from backend.api.models import (
    AnnotationCampaign,
    AnnotationResult,
    AnnotationTask,
    AnnotationComment,
)
from backend.api.serializers import (
    AnnotationCampaignListSerializer,
    AnnotationCampaignRetrieveSerializer,
    AnnotationCampaignCreateSerializer,
    AnnotationCampaignRetrieveAuxCampaignSerializer,
    AnnotationCampaignAddAnnotatorsSerializer,
)


class AnnotationCampaignViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation campaign related actions
    """

    queryset = AnnotationCampaign.objects.all()
    serializer_class = AnnotationCampaignListSerializer

    def list(self, request):
        """List annotation campaigns"""
        queryset = (
            self.queryset.annotate(files_count=Count("datasets__files"))
            .prefetch_related(
                "tasks",
                Prefetch(
                    "tasks",
                    queryset=AnnotationTask.objects.filter(
                        annotator_id=request.user.id
                    ),
                    to_attr="user_tasks",
                ),
                Prefetch(
                    "tasks",
                    queryset=AnnotationTask.objects.filter(status=2),
                    to_attr="complete_tasks",
                ),
                Prefetch(
                    "tasks",
                    queryset=AnnotationTask.objects.filter(
                        annotator_id=request.user.id, status=2
                    ),
                    to_attr="user_complete_tasks",
                ),
            )
            .order_by("name", "created_at")
        )
        serializer = self.serializer_class(queryset, many=True, user_id=request.user.id)
        return Response(serializer.data)

    @extend_schema(responses=AnnotationCampaignRetrieveSerializer)
    def retrieve(self, request, pk=None):
        """Show a specific annotation campaign"""
        annotation_campaign = get_object_or_404(self.queryset, pk=pk)
        serializer = AnnotationCampaignRetrieveSerializer(annotation_campaign)
        return Response(serializer.data)

    @transaction.atomic
    @extend_schema(
        request=AnnotationCampaignCreateSerializer,
        responses=AnnotationCampaignRetrieveAuxCampaignSerializer,
    )
    def create(self, request):
        """Create a new annotation campaign"""
        create_serializer = AnnotationCampaignCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        campaign = create_serializer.save(owner_id=request.user.id)
        serializer = AnnotationCampaignRetrieveAuxCampaignSerializer(campaign)
        return Response(serializer.data)

    @extend_schema(
        request=AnnotationCampaignAddAnnotatorsSerializer,
        responses=AnnotationCampaignRetrieveSerializer,
    )
    @action(detail=True, methods=["post"])
    def add_annotators(self, request, pk=None):
        """Add an annotator to a given annotation campaign"""
        annotation_campaign = get_object_or_404(self.queryset, pk=pk)
        if not request.user.is_staff and not request.user == annotation_campaign.owner:
            return HttpResponse("Unauthorized", status=403)

        add_annotators_serializer = AnnotationCampaignAddAnnotatorsSerializer(
            annotation_campaign, data=request.data
        )
        add_annotators_serializer.is_valid(raise_exception=True)
        campaign = add_annotators_serializer.save(campaign_id=pk)
        serializer = AnnotationCampaignRetrieveSerializer(campaign)
        return Response(serializer.data)

    @extend_schema(
        responses={(200, "text/csv"): str},
        examples=[
            OpenApiExample(
                "CSV campaign results example",
                # pylint: disable-next=line-too-long
                value="""dataset,filename,start_time,end_time,start_frequency,end_frequency,annotation,annotator,start_datetime,end_datetime,is_box
SPM Aural A,sound000.wav,418.0,572.0,9370.0,11567.0,Boat,Albert,2012-05-03T11:10:03+00:00,2012-05-03T11:10:48+00:00,1
SPM Aural A,sound000.wav,543.0,663.0,6333.0,9119.0,Rain,Albert,2012-05-03T11:10:03+00:00,2012-05-03T11:10:48+00:00,1
SPM Aural A,sound001.wav,30.0,233.0,549.0,3551.0,Odoncetes,Albert,2012-05-03T11:10:03+00:00,2012-05-03T11:10:48+00:00,1
SPM Aural A,sound001.wav,1.0,151.0,5751.0,9341.0,Rain,Albert,2012-05-03T11:10:03+00:00,2012-05-03T11:10:48+00:00,1
SPM Aural B,sound000.wav,284.0,493.0,5794.0,8359.0,Boat,Albert,2012-05-03T11:10:03+00:00,2012-05-03T11:10:48+00:00,1""",
                media_type="text/csv",
            )
        ],
    )
    @action(detail=True, renderer_classes=[CSVRenderer])
    def report(self, request, pk=None):
        """Returns the CSV report for the given campaign"""
        # pylint: disable=too-many-locals
        campaign = get_object_or_404(AnnotationCampaign, pk=pk)
        data = [
            [
                "dataset",
                "filename",
                "start_time",
                "end_time",
                "start_frequency",
                "end_frequency",
                "annotation",
                "annotator",
                "start_datetime",
                "end_datetime",
                "is_box",
                "comments",
            ]
        ]

        results = AnnotationResult.objects.prefetch_related(
            "annotation_task",
            "annotation_task__annotator",
            "annotation_task__dataset_file",
            "annotation_task__dataset_file__dataset",
            "annotation_task__dataset_file__audio_metadatum",
            "annotation_tag",
            "result_comments",
        ).filter(annotation_task__annotation_campaign_id=pk)

        task_comments = AnnotationComment.objects.prefetch_related(
            "annotation_task"
        ).filter(
            Q(annotation_task__annotation_campaign_id=pk)
            & Q(annotation_result__isnull=True)
        )

        for result in results:
            audio_meta = result.annotation_task.dataset_file.audio_metadatum
            max_frequency = result.annotation_task.dataset_file.dataset_sr / 2
            max_time = (audio_meta.end - audio_meta.start).seconds
            is_box = (
                campaign.annotation_scope
                == AnnotationCampaign.AnnotationScope.RECTANGLE
                or (
                    result.start_time is not None
                    and result.end_time is not None
                    and result.start_frequency is not None
                    and result.end_frequency is not None
                )
            )
            result_comments = result.result_comments.all()
            if result_comments:
                task = result.annotation_task
                comment = f"{result_comments[0].comment} |- {task.annotator.username}"
            else:
                comment = ""

            data.append(
                [
                    result.annotation_task.dataset_file.dataset.name,
                    result.annotation_task.dataset_file.filename,
                    str(result.start_time or "0"),
                    str(result.end_time or str(max_time)),
                    str(result.start_frequency or "0"),
                    str(result.end_frequency or max_frequency),
                    result.annotation_tag.name,
                    result.annotation_task.annotator.username,
                    (
                        audio_meta.start + timedelta(seconds=(result.start_time or 0))
                    ).isoformat(timespec="milliseconds"),
                    (
                        audio_meta.start
                        + timedelta(seconds=(result.end_time or max_time))
                    ).isoformat(timespec="milliseconds"),
                    "1" if is_box else "0",
                    comment,
                ]
            )

        for task_comment in task_comments:
            task = task_comment.annotation_task
            comment = f"{task_comment.comment} |- {task.annotator.username} : {task.annotator.email}"

            data.append(
                [
                    task_comment.annotation_task.dataset_file.dataset.name,
                    task_comment.annotation_task.dataset_file.filename,
                    "",
                    "",
                    "",
                    "",
                    "",
                    task_comment.annotation_task.annotator.username,
                    "",
                    "",
                    "",
                    comment,
                ]
            )

        response = Response(data)
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{campaign.name.replace(" ", "_")}.csv"'
        return response

    @extend_schema(
        responses={(200, "text/csv"): str},
        examples=[
            OpenApiExample(
                "CSV campaign task status example",
                value="""dataset,filename,alice,bob,carol,dan,erin
SPM Aural A 2010,sound035.wav,FINISHED,CREATED,FINISHED,FINISHED,CREATED
SPM Aural A 2010,sound036.wav,FINISHED,CREATED,FINISHED,STARTED,CREATED
SPM Aural A 2010,sound037.wav,FINISHED,CREATED,STARTED,CREATED,CREATED
SPM Aural A 2010,sound038.wav,FINISHED,CREATED,CREATED,CREATED,CREATED""",
                media_type="text/csv",
            )
        ],
    )
    @action(detail=True, renderer_classes=[CSVRenderer])
    def report_status(self, request, pk=None):
        """Returns the CSV report on tasks status for the given campaign"""
        campaign = get_object_or_404(AnnotationCampaign, pk=pk)
        header = ["dataset", "filename"]
        annotators = (
            campaign.annotators.distinct()
            .order_by("username")
            .values_list("username", flat=True)
        )
        data = [header + list(annotators)]
        tasks = (
            campaign.tasks.select_related(
                "dataset_file", "dataset_file__dataset", "annotator"
            )
            .order_by("dataset_file__dataset__name", "dataset_file__filename")
            .values_list(
                "dataset_file__dataset__name",
                "dataset_file__filename",
                "annotator__username",
                "status",
            )
        )
        tasks_status = {}
        for dataset_name, filename, annotator, status_int in tasks:
            if (dataset_name, filename) not in tasks_status:
                tasks_status[(dataset_name, filename)] = {}
            tasks_status[(dataset_name, filename)][annotator] = status_int

        # We list all dataset_name, filename couples and then annotators + status for each
        for (dataset_name, filename), annotator_status in tasks_status.items():
            status_per_annotator = []
            for annotator in annotators:
                status_string = "UNASSIGNED"  # Default status that will only be kept if no task was given
                if annotator in annotator_status:
                    status_string = AnnotationTask.StatusChoices(
                        annotator_status[annotator]
                    ).name
                status_per_annotator.append(status_string)
            data.append([dataset_name, filename] + status_per_annotator)

        response = Response(data)
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{campaign.name.replace(" ", "_")}_status.csv"'
        return response
