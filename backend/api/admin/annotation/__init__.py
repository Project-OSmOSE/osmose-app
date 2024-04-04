""" Annotation admin management """
from django.contrib import admin

from .detector import (
    DetectorAdmin,
    DetectorConfigurationAdmin,
)
from .result import (
    AnnotationResultAdmin,
    AnnotationResultValidationAdmin,
)
from .campaign import (
    AnnotationCampaignAdmin,
    AnnotationCampaign
)
from backend.api.models.annotation import (
    Detector,
    DetectorConfiguration,
    AnnotationResult,
    AnnotationResultValidation,
)

admin.site.register(Detector, DetectorAdmin)
admin.site.register(DetectorConfiguration, DetectorConfigurationAdmin)

admin.site.register(AnnotationResult, AnnotationResultAdmin)
admin.site.register(AnnotationResultValidation, AnnotationResultValidationAdmin)

admin.site.register(AnnotationCampaign, AnnotationCampaignAdmin)
