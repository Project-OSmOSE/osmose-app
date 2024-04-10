"""Annotation campaign DRF-Viewset file"""

from django.db import transaction
from django.db.models import Count, Q, Exists, OuterRef
from django.db.models.functions import Lower
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiExample
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from backend.api.models import (
    AnnotationCampaign,
    AnnotationResult,
    AnnotationResultValidation,
    AnnotationTask,
    AnnotationComment,
    AnnotationCampaignUsage,
)
from backend.api.serializers import (
    AnnotationCampaignListSerializer,
    AnnotationCampaignRetrieveSerializer,
    AnnotationCampaignRetrieveAuxCampaignSerializer,
    AnnotationCampaignAddAnnotatorsSerializer,
    AnnotationCampaignCreateCheckAnnotationsSerializer,
    AnnotationCampaignCreateCreateAnnotationsSerializer,
)
from backend.utils.renderers import CSVRenderer


class AnnotationCampaignViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for annotation campaign related actions
    """

    queryset = AnnotationCampaign.objects.all()

    @extend_schema(responses=AnnotationCampaignListSerializer)
    def list(self, request):
        """List annotation campaigns"""
        queryset = self.queryset.annotate(
            my_progress=Count(
                "tasks",
                filter=Q(tasks__annotator_id=request.user.id) & Q(tasks__status=2),
            ),
            my_total=Count("tasks", filter=Q(tasks__annotator_id=request.user.id)),
            progress=Count("tasks", filter=Q(tasks__status=2)),
            total=Count("tasks"),
        )
        if not request.user.is_staff:
            queryset = queryset.filter(
                Q(owner_id=request.user.id)
                | (
                    Exists(
                        AnnotationTask.objects.filter(
                            annotation_campaign_id=OuterRef("pk"),
                            annotator_id=request.user.id,
                        )
                    )
                    & Q(archive__isnull=True)
                )
            )
        queryset = queryset.prefetch_related("datasets")
        serializer = AnnotationCampaignListSerializer(
            queryset, many=True, context={"user_id": request.user.id}
        )
        return Response(serializer.data)

    @extend_schema(responses=AnnotationCampaignRetrieveSerializer)
    def retrieve(self, request, pk=None):
        """Show a specific annotation campaign"""
        annotation_campaign = get_object_or_404(self.queryset, pk=pk)
        serializer = AnnotationCampaignRetrieveSerializer(
            annotation_campaign, context={"user_id": request.user.id}
        )
        return Response(serializer.data)

    @transaction.atomic
    @extend_schema(
        responses=AnnotationCampaignRetrieveAuxCampaignSerializer,
    )
    def create(self, request):
        # type: (Request) -> Response
        """Create a new annotation campaign"""
        create_serializer = None
        if request.data["usage"] == AnnotationCampaignUsage.CREATE.label:
            create_serializer = AnnotationCampaignCreateCreateAnnotationsSerializer(
                data=request.data
            )
        elif request.data["usage"] == AnnotationCampaignUsage.CHECK.label:
            create_serializer = AnnotationCampaignCreateCheckAnnotationsSerializer(
                data=request.data
            )
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

    @extend_schema(responses={200: None})
    @action(detail=True, methods=["post"])
    def archive(self, request, pk):
        """Archive a given annotation campaign"""
        annotation_campaign: AnnotationCampaign = get_object_or_404(
            self.queryset, pk=pk
        )
        if not request.user.is_staff and not request.user == annotation_campaign.owner:
            return HttpResponse("Unauthorized", status=403)

        annotation_campaign.do_archive(request.user)
        return HttpResponse(status=200)

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

        results = AnnotationResult.objects.raw(
            """
        SELECT dataset_name,
               filename,
               COALESCE(start_time, 0)                                           as start_time,
               COALESCE(end_time, duration)                                      as end_time,
               COALESCE(start_frequency, 0)                                      as start_frequency,
               COALESCE(end_frequency, sample_rate / 2)                          as end_frequency,
               label.name                                                          as annotation,
               username                                                          as annotator_name,
               detector.name                                                     as detector_name,
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
                                                            LEFT OUTER JOIN audio_metadata am
                                                            on datasets.audio_metadatum_id = am.id) d
                                                           on d.id = f.dataset_id

                                           LEFT OUTER JOIN (SELECT id,
                                                                   start,
                                                                   "end",
                                                                   dataset_sr,
                                                                   extract(EPOCH FROM ("end" - start)) as duration
                                                            FROM audio_metadata) m on m.id = f.audio_metadatum_id) file
                                 on file.id = result.dataset_file_id

                 LEFT OUTER JOIN (SELECT id, name
                                  FROM api_label) label on label.id = result.label_id

                 LEFT OUTER JOIN (SELECT id, username
                                  FROM auth_user) annotator on annotator.id = result.annotator_id

                 LEFT OUTER JOIN (SELECT id, detector_id
                                  FROM api_detectorconfiguration) detector_config
                                   on detector_config.id = result.detector_configuration_id

                 LEFT OUTER JOIN (SELECT id, name
                                  FROM api_detector) detector on detector.id = detector_config.detector_id

                 LEFT OUTER JOIN (SELECT indicator.id, label, level
                                  FROM confidence_indicator indicator) confidence
                                 on confidence.id = result.confidence_indicator_id

                 LEFT OUTER JOIN (SELECT campaign.id,
                                         annotation_scope,
                                         max_confidence_level
                                  FROM annotation_campaigns campaign
                                           LEFT OUTER JOIN (SELECT confidence_indicator_set_id,
                                                                   max(level) as max_confidence_level
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
        if campaign.usage == AnnotationCampaignUsage.CREATE:
            for row in list(results) + list(comments):
                data.append(
                    [
                        row.dataset_name,
                        row.filename,
                        str(row.start_time),
                        str(row.end_time),
                        str(row.start_frequency),
                        str(row.end_frequency),
                        row.annotation,
                        row.annotator_name,
                        str(row.start_date),
                        str(row.end_date),
                        str(row.is_box),
                        str(row.confidence_label),
                        str(row.confidence_level),
                        str(row.comment),
                    ]
                )
        if campaign.usage == AnnotationCampaignUsage.CHECK:
            validations = (
                AnnotationResultValidation.objects.filter(
                    result__annotation_campaign=campaign
                )
                .prefetch_related("annotator")
                .order_by("annotator__username")
            )
            print(
                ">>> ",
                list(
                    validations.values_list("annotator__username", flat=True).distinct()
                ),
            )
            data[0] = data[0] + list(
                validations.values_list("annotator__username", flat=True).distinct()
            )
            print(">>> ", data)
            for row in list(results):
                val_data = validations.filter(result__id=row.id)
                r_data = [
                    row.dataset_name,
                    row.filename,
                    str(row.start_time),
                    str(row.end_time),
                    str(row.start_frequency),
                    str(row.end_frequency),
                    row.annotation,
                    row.detector_name,
                    str(row.start_date),
                    str(row.end_date),
                    str(row.is_box),
                    str(row.confidence_label),
                    str(row.confidence_level),
                    str(row.comment),
                ]
                for user_val in val_data:
                    print(
                        ">>> ",
                        user_val.annotator.username,
                        user_val.is_valid,
                        "'" + str(user_val.is_valid) + "'",
                    )
                    r_data.append(str(user_val.is_valid))
                data.append(r_data)
            for row in list(comments):
                data.append(
                    [
                        row.dataset_name,
                        row.filename,
                        str(row.start_time),
                        str(row.end_time),
                        str(row.start_frequency),
                        str(row.end_frequency),
                        row.annotation,
                        row.annotator_name,
                        str(row.start_date),
                        str(row.end_date),
                        str(row.is_box),
                        str(row.confidence_label),
                        str(row.confidence_level),
                        str(row.comment),
                    ]
                )

        print(">>> ", data)
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

    @extend_schema(
        responses={(200, "text/csv"): str},
        examples=[
            OpenApiExample(
                "Spectrogram configurations example",
                # pylint:disable=C0301
                value="""dataset_name,dataset_sr,nfft,window_size,overlap,colormap,zoom_level,number_adjustment_spectrogram,dynamic_min,dynamic_max,spectro_duration,audio_file_folder_name,data_normalization,hp_filter_min_freq,sensitivity_dB,peak_voltage,spectro_normalization,gain_dB,zscore_duration,window_type,number_spectra,frequency_resolution,temporal_resolution,audio_file_dataset_overlap
TP_annotation_HF_CETIROISE,128000,1024,1024,80,viridis,2,1,10,80,10,10_128000,instrument,2,-170.0,2.5,density,0,original,hamming,1555,125.0,0.002,0""",
                media_type="text/csv",
            )
        ],
    )
    @action(detail=True, renderer_classes=[CSVRenderer])
    def spectro_config(self, request, pk=None):
        """Returns the CSV of spectrogram configurations for the given campaign"""

        campaign = get_object_or_404(AnnotationCampaign, pk=pk)
        header = [
            "dataset_name",
            "dataset_sr",
            "nfft",
            "window_size",
            "overlap",
            "colormap",
            "zoom_level",
            # "number_adjustment_spectrogram",
            "dynamic_min",
            "dynamic_max",
            # "spectro_duration",
            # "audio_file_folder_name",
            "data_normalization",
            "hp_filter_min_freq",
            # "sensitivity_dB",
            # "peak_voltage",
            "spectro_normalization",
            # "gain_dB",
            "zscore_duration",
            "window_type",
            # "number_spectra",
            "frequency_resolution",
            # "temporal_resolution",
            # "audio_file_dataset_overlap"
        ]
        data = [header]

        for config in campaign.spectro_configs.all():
            config_data = []
            for label in header:
                if label == "dataset_name":
                    config_data.append(config.dataset.name)
                elif label == "dataset_sr":
                    config_data.append(str(config.dataset.audio_metadatum.dataset_sr))
                else:
                    config_data.append(str(getattr(config, label)))
            data.append(config_data)

        response = Response(data)
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{campaign.name.replace(" ", "_")}_audio_metadata.csv"'
        return response

    @extend_schema(
        responses={(200, "text/csv"): str},
        examples=[
            OpenApiExample(
                "Spectrogram configurations example",
                # pylint:disable=C0301
                value="""origin_sr,sample_bits,channel_count,audio_file_count,start_date,end_date,audio_file_origin_duration,audio_file_origin_volume,dataset_origin_volume,dataset_origin_duration,is_built,audio_file_dataset_overlap,lat,lon,depth,dataset_sr,audio_file_dataset_duration
128000,16,1,10,2022-07-17T00:25:46.000000+0200,2022-07-17T23:22:17.000000+0200,10,2.560036,25.6,100,True,0,48.5,-5.5,100,128000,10
""",
                media_type="text/csv",
            )
        ],
    )
    @action(detail=True, renderer_classes=[CSVRenderer])
    def audio_metadata(self, request, pk=None):
        """Returns the CSV of spectrogram configurations for the given campaign"""

        campaign = get_object_or_404(AnnotationCampaign, pk=pk)
        header = [
            "dataset",
            # "origin_sr",
            "sample_bits",
            "channel_count",
            # "audio_file_count",
            "start_date",
            "end_date",
            # "audio_file_origin_duration",
            # "audio_file_origin_volume",
            # "dataset_origin_volume",
            # "dataset_origin_duration",
            # "is_built",
            # "audio_file_dataset_overlap",
            # "lat",
            # "lon",
            # "depth",
            "dataset_sr",
            # "audio_file_dataset_duration"
        ]
        data = [header]

        for dataset in campaign.datasets.all():
            metadatum_data = []
            for label in header:
                if label == "dataset":
                    metadatum_data.append(dataset.name)
                elif label == "start_date":
                    metadatum_data.append(str(dataset.audio_metadatum.start))
                elif label == "end_date":
                    metadatum_data.append(str(dataset.audio_metadatum.end))
                else:
                    metadatum_data.append(str(getattr(dataset.audio_metadatum, label)))
            data.append(metadatum_data)

        response = Response(data)
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{campaign.name.replace(" ", "_")}_audio_metadata.csv"'
        return response
