from django.contrib import admin

from backend.api.models import (
    Dataset,
    DatasetFile,
    AnnotationSet,
    AnnotationTag,
    AnnotationCampaign,
    SpectroConfig,
    DatasetType,
    AudioMetadatum,
    GeoMetadatum,
)

admin.site.register(Dataset, admin.ModelAdmin)
admin.site.register(DatasetFile, admin.ModelAdmin)
admin.site.register(AnnotationSet, admin.ModelAdmin)
admin.site.register(AnnotationTag, admin.ModelAdmin)
admin.site.register(AnnotationCampaign, admin.ModelAdmin)
admin.site.register(DatasetType, admin.ModelAdmin)
admin.site.register(AudioMetadatum, admin.ModelAdmin)
admin.site.register(GeoMetadatum, admin.ModelAdmin)
admin.site.register(SpectroConfig, admin.ModelAdmin)
