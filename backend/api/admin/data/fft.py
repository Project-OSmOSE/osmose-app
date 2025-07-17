"""API data fft administration"""
from django.contrib import admin

from backend.api.models import FFT


@admin.register(FFT)
class FFTAdmin(admin.ModelAdmin):
    """FFT presentation in DjangoAdmin"""

    list_display = (
        "id",
        "nfft",
        "window",
        "window_size",
        "overlap",
        "sampling_frequency",
        "scaling",
        "legacy",
    )
