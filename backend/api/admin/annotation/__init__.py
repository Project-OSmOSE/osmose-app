""" Annotation admin management """
from django.contrib import admin

from backend.api.models.annotation import (
    Detector,
    DetectorConfiguration,
    AnnotationResultValidation,
)
from .campaign import AnnotationCampaignAdmin
from .confidence import ConfidenceIndicatorAdmin, ConfidenceIndicatorSetAdmin
from .detector import (
    DetectorAdmin,
    DetectorConfigurationAdmin,
)
from .result import (
    AnnotationResultAdmin,
    AnnotationResultValidationAdmin,
)
from .task import AnnotationTaskAdmin

admin.site.register(Detector, DetectorAdmin)
admin.site.register(DetectorConfiguration, DetectorConfigurationAdmin)

admin.site.register(AnnotationResultValidation, AnnotationResultValidationAdmin)
