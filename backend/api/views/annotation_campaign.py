"""Annotation campaign DRF-Viewset file"""
from datetime import timedelta

from django.db import transaction
from django.db.models import (
    Count,
    Q,
    Exists,
    OuterRef,
    F,
    Max,
    BooleanField,
    ExpressionWrapper,
    Value,
    FloatField,
    BigIntegerField,
    DurationField,
)
from django.db.models.functions import Lower, Cast, Extract
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
        queryset = queryset.prefetch_related("datasets").order_by("name")
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
    def report(self, request, pk: int = None) -> Response:
        """Returns the CSV report for the given campaign"""
        # pylint: disable=too-many-locals
        campaign: AnnotationCampaign = get_object_or_404(
            AnnotationCampaign.objects.prefetch_related(
                "confidence_indicator_set__confidence_indicators"
            ).annotate(
                max_confidence=Max(
                    "confidence_indicator_set__confidence_indicators__level"
                )
            ),
            pk=pk,
        )

        file_duration = Cast(
            Extract(
                ExpressionWrapper(
                    F("dataset_file__audio_metadatum__end")
                    - F("dataset_file__audio_metadatum__start"),
                    output_field=DurationField(),
                ),
                "epoch",
            ),
            FloatField(),
        )
        file_max_frequency = ExpressionWrapper(
            F("dataset_file__dataset__audio_metadatum__dataset_sr") / 2,
            output_field=FloatField(),
        )
        results = (
            AnnotationResult.objects.filter(annotation_campaign_id=pk)
            .select_related(
                "dataset_file",
                "dataset_file__audio_metadatum",
                "dataset_file__dataset",
                "dataset_file__dataset__audio_metadatum",
                "label",
                "confidence_indicator",
                "annotator",
                "detector_configuration__detector",
            )
            .annotate(
                file_duration=file_duration,
                file_max_frequency=file_max_frequency,
                file_name=F("dataset_file__filename"),
                dataset_name=F("dataset_file__dataset__name"),
                file_start=F("dataset_file__audio_metadatum__start"),
                file_end=F("dataset_file__audio_metadatum__end"),
                label_name=F("label__name"),
                annotator_name=F("annotator__username"),
                detector_name=F("detector_configuration__detector__name"),
                comment_content=F("result_comments__comment"),
                comment_author=F(
                    "result_comments__annotation_task__annotator__username"
                ),
                confidence_label=F("confidence_indicator__label"),
                confidence_level=F("confidence_indicator__level"),
                is_weak=ExpressionWrapper(
                    (Q(start_time__isnull=True) | Q(start_time=0))
                    & (Q(end_time__isnull=True) | Q(end_time=file_duration))
                    & (Q(start_frequency__isnull=True) | Q(start_frequency=0))
                    & (
                        Q(end_frequency__isnull=True)
                        | Q(end_frequency=file_max_frequency)
                    ),
                    output_field=BooleanField(),
                ),
            )
        )
        comments = (
            AnnotationComment.objects.filter(
                annotation_task__annotation_campaign_id=pk,
                annotation_result__isnull=True,
            )
            .select_related(
                "annotation_task__dataset_file",
                "annotation_task__dataset_file__dataset",
                "annotation_task__dataset_file__audio_metadatum",
                "annotation_task__annotator",
            )
            .annotate(
                file_name=F("annotation_task__dataset_file__filename"),
                dataset_name=F("annotation_task__dataset_file__dataset__name"),
                annotator_name=F("annotation_task__annotator__username"),
                comment_content=F("comment"),
                comment_author=F("annotation_task__annotator__username"),
                start_time=Value(""),
                end_time=Value(""),
                start_frequency=Value(""),
                end_frequency=Value(""),
                label_name=Value(""),
                confidence_label=Value(""),
                confidence_level=Value(""),
                is_weak=Value(""),
                file_start=F("annotation_task__dataset_file__audio_metadatum__start"),
                file_end=F("annotation_task__dataset_file__audio_metadatum__end"),
                file_duration=ExpressionWrapper(
                    F("annotation_task__dataset_file__audio_metadatum__end")
                    - F("annotation_task__dataset_file__audio_metadatum__start"),
                    output_field=BigIntegerField(),
                ),
                file_max_frequency=ExpressionWrapper(
                    F(
                        "annotation_task__dataset_file__dataset__audio_metadatum__dataset_sr"
                    )
                    / 2,
                    output_field=FloatField(),
                ),
            )
        )
        validations = (
            AnnotationResultValidation.objects.filter(
                result__annotation_campaign=campaign
            )
            .prefetch_related("annotator")
            .order_by("annotator__username")
        )
        validate_users = list(
            validations.values_list("annotator__username", flat=True).distinct()
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

        def map_result(row):
            return [
                row.dataset_name,
                row.file_name,
                str(row.start_time) if row.start_time else "0",
                str(row.end_time) if row.end_time else str(row.file_duration),
                str(row.start_frequency) if row.start_frequency else "0",
                str(row.end_frequency)
                if row.end_frequency
                else str(row.file_max_frequency),
                row.label_name,
                row.annotator_name if row.annotator_name else row.detector_name,
                (row.file_start + timedelta(seconds=row.start_time or 0)).isoformat(
                    timespec="milliseconds"
                ),
                (row.file_start + timedelta(seconds=row.end_time)).isoformat(
                    timespec="milliseconds"
                )
                if row.end_time
                else row.file_end.isoformat(timespec="milliseconds"),
                str(1 if campaign.annotation_scope == 1 or not row.is_weak else 0)
                if isinstance(row.is_weak, bool)
                else "",
                row.confidence_label if row.confidence_label else "",
                f"{row.confidence_level}/{campaign.max_confidence}"
                if isinstance(row.confidence_level, int)
                else "",
                f"{row.comment_content} |- {row.comment_author}"
                if row.comment_content
                else "",
            ]

        def map_result_check(row):
            check_data = map_result(row)
            for user in validate_users:
                validation = validations.filter(
                    result__id=row.id, annotator__username=user
                )
                check_data.append(
                    str(validation.first().is_valid) if validation.count() > 0 else ""
                )
            return check_data

        if campaign.usage == AnnotationCampaignUsage.CREATE:
            data.extend(map(map_result, list(results) + list(comments)))

        if campaign.usage == AnnotationCampaignUsage.CHECK:
            data[0] = data[0] + validate_users
            data.extend(map(map_result_check, list(results) + list(comments)))

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
            "dynamic_min",
            "dynamic_max",
            "spectro_duration",
            "data_normalization",
            "hp_filter_min_freq",
            "sensitivity_dB",  # seulement pour normalisation instrument / vide pour zscore
            "peak_voltage",  # seulement pour normalisation instrument / vide pour zscore
            "gain_dB",  # seulement pour normalisation instrument / vide pour zscore
            "spectro_normalization",
            "zscore_duration",  # seulement pour normalisation zscore / vide pour instrument
            "window_type",
            "frequency_resolution",
            "temporal_resolution",
            "audio_file_dataset_overlap",
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
                    value = getattr(config, label)
                    if value is None:
                        value = ""
                    else:
                        value = str(value)
                    config_data.append(value)
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
            "sample_bits",
            "channel_count",
            "audio_file_count",
            "start_date",
            "end_date",
            # "dataset_origin_volume",
            # "dataset_origin_duration",
            # "is_built",
            # "audio_file_dataset_overlap",
            # "lat",
            # "lon",
            # "depth",
            "dataset_sr",
            "audio_file_dataset_duration",
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
