"""Admin classes for annotation task"""
from django.contrib import admin

from backend.api.models import AnnotationTask, AnnotationFileRange


@admin.register(AnnotationFileRange)
class AnnotationFileRangeAdmin(admin.ModelAdmin):
    """AnnotationFileRange Admin"""

    list_display = (
        "first_file_index",
        "last_file_index",
        "annotator",
        "annotation_campaign",
    )
    search_fields = (
        "annotation_campaign__name",
        "annotator__username",
        "annotator__firstname",
        "annotator__lastname",
    )


@admin.register(AnnotationTask)
class AnnotationTaskAdmin(admin.ModelAdmin):
    """AnnotationTask presentation in DjangoAdmin"""

    list_display = (
        "status",
        "annotation_campaign",
        "dataset_file",
        "annotator",
    )
    search_fields = ("dataset_file__filename",)
    list_filter = ("status", "annotation_campaign", "annotator")

    def clean_duplicates(self, request, queryset):
        """Clean duplicated annotation task"""
        task: AnnotationTask
        for task in queryset.iterator():
            AnnotationTask.objects.filter(
                annotation_campaign_id=task.annotation_campaign_id,
                dataset_file_id=task.dataset_file_id,
                annotator_id=task.annotator_id,
                status=0,
                id__gt=task.id,
            ).delete()

    clean_duplicates.short_description = (
        "Clean duplicated tasks (for same annotator, "
        'campaign, dataset_file -- Only clean "created" tasks)'
    )
    clean_duplicates.acts_on_all = True
    actions = [
        clean_duplicates,
    ]
