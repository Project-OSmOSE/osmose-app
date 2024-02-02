from django.contrib import admin

from backend.api.admin.annotation.detector import DetectorAdmin
from backend.api.models.annotation import Detector

admin.site.register(Detector, DetectorAdmin)
