"""Annotation campaign DRF-Viewset file"""

from django.db import transaction
from django.db.models.functions import Lower
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiExample
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

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
from backend.utils.renderers import CSVRenderer


class AnnotationCampaignViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation campaign related actions
    """

    queryset = AnnotationCampaign.objects.all()
    serializer_class = AnnotationCampaignListSerializer

    def list(self, request):
        """List annotation campaigns"""
        queryset = self.queryset.raw(
            """
                SELECT campaign.id,
                       campaign.name,
                       "desc",
                       instructions_url,
                       start,
                       "end",
                       usage,
                       tasks.complete_count      as complete_tasks_count,
                       tasks.user_count          as user_tasks_count,
                       tasks.user_complete_count as user_complete_tasks_count,
                       files.count               as files_count,
                       confidence.name           as confidence_indicator_set_name,
                       annotation.name           as annotation_set_name,
                       created_at
                FROM annotation_campaigns campaign
                LEFT OUTER JOIN
                     (SELECT annotation_campaign_id,
                             count(*) filter(where status = 2) as complete_count,
                             count(*) filter(where annotator_id = %s) as user_count,
                             count(*) filter(where annotator_id = %s and status = 2) as user_complete_count
                      FROM annotation_tasks
                      WHERE %s or annotator_id = %s
                      group by annotation_campaign_id) tasks
                     on tasks.annotation_campaign_id = campaign.id
                 LEFT OUTER JOIN
                     (SELECT annotationcampaign_id, count(*)
                      FROM dataset_files LEFT OUTER JOIN annotation_campaigns_datasets
                          on dataset_files.dataset_id = annotation_campaigns_datasets.dataset_id
                      group by annotationcampaign_id) files
                     on files.annotationcampaign_id = campaign.id
                 LEFT OUTER JOIN
                     (SELECT id, name
                      FROM confidence_sets) confidence
                     on confidence.id = campaign.confidence_indicator_set_id
                 LEFT OUTER JOIN
                     (SELECT id, name
                      FROM annotation_sets) annotation
                     on annotation.id = campaign.annotation_set_id
                WHERE tasks.user_count is not null or %s
                ORDER BY lower(campaign.name), created_at""",
            (
                request.user.id,
                request.user.id,
                request.user.is_staff,
                request.user.id,
                request.user.is_staff,
            ),
        )
        serializer = self.serializer_class(queryset, many=True)
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
        # type: (any, int) -> Response
        """Returns the CSV report for the given campaign"""
        # pylint: disable=too-many-locals
        campaign = get_object_or_404(
            AnnotationCampaign.objects.prefetch_related(
                "confidence_indicator_set__confidence_indicators"
            ),
            pk=pk,
        )
        data = [
            [  # headers
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
                "confidence_indicator_label",
                "confidence_indicator_level",
                "comments",
            ]
        ]

        results = AnnotationResult.objects.raw(
            """
        SELECT dataset_name,
               filename,
               COALESCE(start_time, 0)                                           as start_time,
               COALESCE(end_time, duration)                                      as end_time,
               COALESCE(start_frequency, 0)                                      as start_frequency,
               COALESCE(end_frequency, sample_rate / 2)                          as end_frequency,
               tag.name                                                          as annotation,
               username                                                          as annotator_name,
               (extract(EPOCH FROM start) + COALESCE(start_time, 0)) * 1000      as start_date,
               (extract(EPOCH FROM start) + COALESCE(end_time, duration)) * 1000 as end_date,
               CASE
                   WHEN campaign.annotation_scope = 1 or
                        not (start_time is null or end_time is null or start_frequency is null or end_frequency is null)
                       THEN 1
                   else 0 end                                                as is_box,
               CASE 
                   WHEN confidence.label is null then ''
                   else confidence.label end                                     as confidence_label,
               CASE
                   WHEN confidence_indicator_id is null then ''
                   else CONCAT(confidence.level, '/', max_confidence_level) end  as confidence_level,
               CASE
                   WHEN comment is null then ''
                   else concat(comment, ' |- ', username) end                    as comment,
               concat(comment, ' |- ', username)                    as comment_content,
               result.id
        FROM annotation_results result
        
                 LEFT OUTER JOIN (SELECT f.id,
                                         filename,
                                         d.name                               as dataset_name,
                                         start,
                                         "end",
                                         duration,
                                         COALESCE(m.dataset_sr, d.dataset_sr) as sample_rate
                                  FROM dataset_files f
        
                                           LEFT OUTER JOIN (SELECT datasets.id, name, dataset_sr
                                                            FROM datasets
                                                                     LEFT OUTER JOIN audio_metadata am on datasets.audio_metadatum_id = am.id) d
                                                           on d.id = f.dataset_id
        
                                           LEFT OUTER JOIN (SELECT id,
                                                                   start,
                                                                   "end",
                                                                   dataset_sr,
                                                                   extract(EPOCH FROM ("end" - start)) as duration
                                                            FROM audio_metadata) m on m.id = f.audio_metadatum_id) file
                                 on file.id = result.dataset_file_id
        
                 LEFT OUTER JOIN (SELECT id, name
                                  FROM annotation_tags) tag on tag.id = result.annotation_tag_id
        
                 LEFT OUTER JOIN (SELECT id, username
                                  FROM auth_user) annotator on annotator.id = result.annotator_id
        
                 LEFT OUTER JOIN (SELECT indicator.id, label, level
                                  FROM confidence_indicator indicator) confidence
                                 on confidence.id = result.confidence_indicator_id
        
                 LEFT OUTER JOIN (SELECT campaign.id,
                                         annotation_scope,
                                         max_confidence_level
                                  FROM annotation_campaigns campaign
                                           LEFT OUTER JOIN (SELECT confidence_indicator_set_id, max(level) as max_confidence_level
                                                            FROM confidence_indicator indicator
                                                            GROUP BY confidence_indicator_set_id) confidence
                                                           on confidence.confidence_indicator_set_id =
                                                              campaign.confidence_indicator_set_id) campaign
                                 on campaign.id = result.annotation_campaign_id
        
                 LEFT OUTER JOIN (SELECT annotation_result_id, comment
                                  FROM annotation_comment) comments 
                                  on comments.annotation_result_id = result.id
        WHERE annotation_campaign_id = %s
        """,
            (pk,),
        )
        comments = AnnotationComment.objects.raw(
            """
        SELECT name                              as dataset_name,
               filename,
               ''                                as start_time,
               ''                                as end_time,
               ''                                as start_frequency,
               ''                                as end_frequency,
               ''                                as annotation,
               username                          as annotator_name,
               ''                                as start_date,
               ''                                as end_date,
               ''                                as is_box,
               ''                                as confidence_label,
               ''                                as confidence_level,
               concat(comment, ' |- ', username) as comment,
               concat(comment, ' |- ', username) as comment_content,
               annotation_comment.id
        FROM annotation_comment
                 LEFT OUTER JOIN (select id, dataset_file_id, annotator_id, annotation_campaign_id
                                  FROM annotation_tasks) t on t.id = annotation_comment.annotation_task_id
        
                 LEFT OUTER JOIN (select id, dataset_id, filename
                                  FROM dataset_files) f on f.id = t.dataset_file_id
        
                 LEFT OUTER JOIN (select id, name
                                  FROM datasets) d on d.id = f.dataset_id
        
                 LEFT OUTER JOIN (select id, username
                                  FROM auth_user) u on u.id = t.annotator_id
        WHERE annotation_result_id is null and t.annotation_campaign_id = %s
        """,
            (pk,),
        )
        for r in list(results) + list(comments):
            data.append(
                [
                    r.dataset_name,
                    r.filename,
                    str(r.start_time),
                    str(r.end_time),
                    str(r.start_frequency),
                    str(r.end_frequency),
                    r.annotation,
                    r.annotator_name,
                    str(r.start_date),
                    str(r.end_date),
                    str(r.is_box),
                    str(r.confidence_label),
                    str(r.confidence_level),
                    str(r.comment),
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
            .order_by(Lower("username"))
            .values_list("username", flat=True)
        )
        data = [header + list(annotators)]
        tasks = (
            campaign.tasks.select_related(
                "dataset_file", "dataset_file__dataset", "annotator"
            )
            .order_by(
                Lower("dataset_file__dataset__name"), Lower("dataset_file__filename")
            )
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
