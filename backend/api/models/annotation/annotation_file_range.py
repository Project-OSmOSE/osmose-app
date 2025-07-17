"""File range model"""
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Exists, Subquery, OuterRef, signals
from django.dispatch import receiver

from .annotation_phase import AnnotationPhase
from .annotation_task import AnnotationTask
from ..data import Spectrogram


class AnnotationFileRange(models.Model):
    """Gives a range of files to annotate by an annotator within a campaign"""

    class Meta:
        ordering = ["first_file_index"]
        # TODO: find a way to get this constraints back without crash the serializer
        #  unique_together = (
        #      (
        #          "first_file_index",
        #          "last_file_index",
        #          "annotation_campaign",
        #          "annotator",
        #      ),
        #  )

    first_file_index = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    last_file_index = models.PositiveIntegerField(validators=[MinValueValidator(0)])

    from_datetime = models.DateTimeField()
    to_datetime = models.DateTimeField()

    files_count = models.PositiveIntegerField()
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="annotation_file_ranges",
    )
    annotation_phase = models.ForeignKey(
        AnnotationPhase,
        on_delete=models.CASCADE,
        related_name="annotation_file_ranges",
    )

    def save(self, *args, **kwargs):
        self.files_count = self.last_file_index - self.first_file_index + 1

        analysis_ids = self.annotation_phase.annotation_campaign.analysis.values_list(
            "id", flat=True
        )
        files = Spectrogram.objects.filter(analysis__id__in=analysis_ids)

        from_datetime = files[self.first_file_index].start
        to_datetime = files[self.last_file_index].end
        if from_datetime > to_datetime:
            self.from_datetime, self.to_datetime = to_datetime, from_datetime

        super().save(*args, **kwargs)

    # TODO:
    # @property
    # def tasks(self) -> QuerySet[AnnotationTask]:
    #     """Get file range tasks"""
    #     return AnnotationTask.objects.filter(
    #         annotation_phase_id=self.annotation_phase_id,
    #         annotator_id=self.annotator_id,
    #         spectrogram__start__gte=self.from_datetime,
    #         spectrogram__end__lte=self.to_datetime,
    #     )

    # TODO:
    # @property
    # def results(self) -> QuerySet[AnnotationResult]:
    #     """Get file range results"""
    #     if self.annotation_campaign_phase.phase == Phase.VERIFICATION:
    #         return AnnotationResult.objects.filter(
    #             annotation_campaign_phase__annotation_campaign_id=self.annotation_campaign_phase.annotation_campaign_id,
    #             dataset_file__start__gte=self.from_datetime,
    #             dataset_file__end__lte=self.to_datetime,
    #         ).filter(
    #             (
    #                     Q(annotation_campaign_phase_id=self.id)
    #                     & Q(annotator_id=self.annotator_id)
    #             )
    #             | (
    #                     ~Q(annotation_campaign_phase_id=self.id)
    #                     & ~Q(annotator_id=self.annotator_id)
    #             )
    #         )
    #     return AnnotationResult.objects.filter(
    #         annotation_campaign_phase=self.annotation_campaign_phase,
    #         annotator_id=self.annotator_id,
    #         dataset_file__start__gte=self.from_datetime,
    #         dataset_file__end__lte=self.to_datetime,
    #     )

    # TODO:
    # def _get_tasks(self) -> QuerySet[AnnotationTask]:
    #     return self.tasks.annotate(
    #         other_range_exist=Exists(
    #             Subquery(
    #                 AnnotationFileRange.objects.filter(
    #                     ~Q(id=self.id)
    #                     & Q(
    #                         annotator_id=self.annotator_id,
    #                         annotation_campaign_phase=self.annotation_campaign_phase,
    #                         from_datetime__lte=OuterRef("dataset_file__start"),
    #                         to_datetime__gte=OuterRef("dataset_file__end"),
    #                     )
    #                 )
    #             )
    #         )
    #     )

    # TODO:
    # @staticmethod
    # def get_connected_ranges(data):
    #     """Recover connected ranges"""
    #     return (
    #         AnnotationFileRange.objects.filter(
    #             annotator_id=data.annotator,
    #             annotation_campaign_phase_id=data.annotation_campaign_phase,
    #         )
    #         .exclude(id=data.id)
    #         .filter(
    #             # get bigger
    #             Q(
    #                 first_file_index__lte=data.first_file_index,
    #                 last_file_index__gte=data.last_file_index,
    #             )
    #             # get littler
    #             | Q(
    #                 first_file_index__gte=data.first_file_index,
    #                 last_file_index__lte=data.last_file_index,
    #             )
    #             # get mixted
    #             | Q(
    #                 first_file_index__lte=data.first_file_index,
    #                 last_file_index__gte=data.first_file_index,
    #                 last_file_index__lte=data.last_file_index,
    #             )
    #             | Q(
    #                 first_file_index__gte=data.first_file_index,
    #                 first_file_index__lte=data.last_file_index,
    #                 last_file_index__gte=data.last_file_index,
    #             )
    #             # get siblings
    #             | Q(first_file_index=data.last_file_index + 1)
    #             | Q(last_file_index=data.first_file_index - 1)
    #         )
    #     )

    # TODO:
    # @staticmethod
    # def clean_connected_ranges(data: list[dict]):
    #     """Clean connected ranges to limit the number of different items"""
    #     ids = [file_range["id"] for file_range in data]
    #     return_ids = []
    #     for range_id in ids:
    #         queryset = AnnotationFileRange.objects.filter(id=range_id)
    #         if not queryset.exists():
    #             continue
    #         item = queryset.first()
    #         connected_ranges = AnnotationFileRange.get_connected_ranges(item)
    #         if connected_ranges.exists():
    #             # update connected
    #             min_first_index = min(
    #                 connected_ranges.order_by("first_file_index")
    #                 .first()
    #                 .first_file_index,
    #                 item.first_file_index,
    #                 )
    #             max_last_index = max(
    #                 connected_ranges.order_by("-last_file_index")
    #                 .first()
    #                 .last_file_index,
    #                 item.last_file_index,
    #                 )
    #             instance = connected_ranges.order_by("id").first()
    #             duplicates = AnnotationFileRange.objects.filter(
    #                 annotator_id=instance.annotator_id,
    #                 annotation_campaign_phase_id=instance.annotation_campaign_phase_id,
    #                 first_file_index=min_first_index,
    #                 last_file_index=max_last_index,
    #             )
    #             if duplicates.exists():
    #                 instance = duplicates.first()
    #             else:
    #                 instance.first_file_index = min_first_index
    #                 instance.last_file_index = max_last_index
    #                 instance.save()
    #             return_ids.append(instance.id)
    #             connected_ranges.exclude(id=instance.id).delete()
    #     return AnnotationFileRange.objects.filter(id__in=return_ids)

    # TODO:
    # @staticmethod
    # def get_finished_task_count_query() -> Subquery:
    #     """Avoid duplicated code"""
    #     return Subquery(
    #         AnnotationTask.objects.filter(
    #             annotator_id=OuterRef("annotator_id"),
    #             annotation_campaign_phase_id=OuterRef("annotation_campaign_phase_id"),
    #             dataset_file__start__gte=OuterRef("from_datetime"),
    #             dataset_file__end__lte=OuterRef("to_datetime"),
    #             status=AnnotationTask.Status.FINISHED,
    #         )
    #         .annotate(count=Func(F("id"), function="Count"))
    #         .values("count")
    #     )


def clean_orphan_tasks():
    """Clean all tasks not related to a file range"""
    AnnotationTask.objects.filter(
        ~Exists(
            Subquery(
                AnnotationFileRange.objects.filter(
                    annotator_id=OuterRef("annotator_id"),
                    annotation_phase_id=OuterRef("annotation_phase_id"),
                    from_datetime__lte=OuterRef("spectrogram__start"),
                    to_datetime__gte=OuterRef("spectrogram__end"),
                )
            )
        )
    ).delete()


@receiver(signal=signals.post_save, sender=AnnotationFileRange)
def after_save(sender, instance, **kwargs):
    """After file range saved"""
    print(" > after save")
    clean_orphan_tasks()


@receiver(signal=signals.post_delete, sender=AnnotationFileRange)
def after_delete(sender, instance, **kwargs):
    """After file range deleted"""
    print(" > after delete")
    clean_orphan_tasks()
