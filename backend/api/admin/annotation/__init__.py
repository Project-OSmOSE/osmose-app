from django.contrib import admin

from backend.api.admin.annotation.detector import (
    DetectorAdmin,
    DetectorConfigurationAdmin,
)
from backend.api.admin.annotation.result import (
    AnnotationResultAdmin,
    AnnotationResultValidationAdmin,
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