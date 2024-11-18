# pylint: disable=missing-module-docstring, missing-class-docstring, missing-function-docstring, duplicate-code

from django.test import TestCase
from rest_framework.utils.serializer_helpers import ReturnDict

from backend.api.models import AnnotationResultAcousticFeatures, SignalTrend
from backend.api.serializers import AnnotationResultAcousticFeaturesSerializer


class AbstractTestCase(TestCase):
    def check_correct(self, instance: AnnotationResultAcousticFeatures):
        self.assertEqual(instance.start_frequency, 10)
        self.assertEqual(instance.end_frequency, 50)
        self.assertEqual(instance.min_frequency, 5)
        self.assertEqual(instance.max_frequency, 500)
        self.assertEqual(instance.median_frequency, 25)
        self.assertEqual(instance.beginning_sweep_slope, 25)
        self.assertEqual(instance.end_sweep_slope, 25)
        self.assertEqual(instance.steps_count, 2)
        self.assertEqual(instance.relative_peaks_count, 2)
        self.assertEqual(instance.has_harmonics, True)
        self.assertEqual(instance.harmonics_count, 3)
        self.assertEqual(instance.level_peak_frequency, 53)
        self.assertEqual(instance.duration, 53)
        self.assertEqual(instance.trend, SignalTrend.MODULATED)

    def check_empty(self, instance: AnnotationResultAcousticFeatures):
        self.assertEqual(instance.start_frequency, None)
        self.assertEqual(instance.end_frequency, None)
        self.assertEqual(instance.min_frequency, None)
        self.assertEqual(instance.max_frequency, None)
        self.assertEqual(instance.median_frequency, None)
        self.assertEqual(instance.beginning_sweep_slope, None)
        self.assertEqual(instance.end_sweep_slope, None)
        self.assertEqual(instance.steps_count, None)
        self.assertEqual(instance.relative_peaks_count, None)
        self.assertEqual(instance.has_harmonics, None)
        self.assertEqual(instance.harmonics_count, None)
        self.assertEqual(instance.level_peak_frequency, None)
        self.assertEqual(instance.duration, None)
        self.assertEqual(instance.trend, None)

    def check_errors(self, errors: ReturnDict):
        self.assertEqual(errors["start_frequency"][0].code, "min_value")
        self.assertEqual(errors["end_frequency"][0].code, "min_value")
        self.assertEqual(errors["min_frequency"][0].code, "min_value")
        self.assertEqual(errors["max_frequency"][0].code, "min_value")
        self.assertEqual(errors["median_frequency"][0].code, "min_value")
        self.assertEqual("beginning_sweep_slope" in errors, False)
        self.assertEqual("end_sweep_slope" in errors, False)
        self.assertEqual(errors["steps_count"][0].code, "min_value")
        self.assertEqual(errors["relative_peaks_count"][0].code, "min_value")
        self.assertEqual("has_harmonics" in errors, False)
        self.assertEqual(errors["harmonics_count"][0].code, "min_value")
        self.assertEqual(errors["level_peak_frequency"][0].code, "min_value")
        self.assertEqual(errors["duration"][0].code, "min_value")
        self.assertEqual("trend" in errors, False)


class AcousticFeaturesCreateTestCase(AbstractTestCase):
    def test_correct(self):
        serializer = AnnotationResultAcousticFeaturesSerializer(
            data={
                "start_frequency": 10,
                "end_frequency": 50,
                "min_frequency": 5,
                "max_frequency": 500,
                "median_frequency": 25,
                "beginning_sweep_slope": 25,
                "end_sweep_slope": 25,
                "steps_count": 2,
                "relative_peaks_count": 2,
                "has_harmonics": True,
                "harmonics_count": 3,
                "level_peak_frequency": 53,
                "duration": 53,
                "trend": "Modulated",
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.check_correct(serializer.instance)

    def test_empty(self):
        serializer = AnnotationResultAcousticFeaturesSerializer(
            data={
                "start_frequency": None,
                "end_frequency": None,
                "min_frequency": None,
                "max_frequency": None,
                "median_frequency": None,
                "beginning_sweep_slope": None,
                "end_sweep_slope": None,
                "steps_count": None,
                "relative_peaks_count": None,
                "has_harmonics": None,
                "harmonics_count": None,
                "level_peak_frequency": None,
                "duration": None,
                "trend": None,
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.check_empty(serializer.instance)

    def test_invalid_negative_number(self):
        serializer = AnnotationResultAcousticFeaturesSerializer(
            data={
                "start_frequency": -10,
                "end_frequency": -50,
                "min_frequency": -5,
                "max_frequency": -500,
                "median_frequency": -25,
                "beginning_sweep_slope": -25,
                "end_sweep_slope": -25,
                "steps_count": -2,
                "relative_peaks_count": -2,
                "has_harmonics": True,
                "harmonics_count": -3,
                "level_peak_frequency": -53,
                "duration": -53,
                "trend": "Modulated",
            }
        )
        serializer.is_valid(raise_exception=False)
        self.check_errors(serializer.errors)


class AcousticFeaturesUpdateTestCase(AbstractTestCase):
    def setUp(self):
        self.instance = AnnotationResultAcousticFeatures.objects.create(
            **{
                "start_frequency": 0,
                "end_frequency": 0,
                "min_frequency": 0,
                "max_frequency": 0,
                "median_frequency": 0,
                "beginning_sweep_slope": 0,
                "end_sweep_slope": 0,
                "steps_count": 0,
                "relative_peaks_count": 0,
                "has_harmonics": False,
                "harmonics_count": 0,
                "level_peak_frequency": 0,
                "duration": 0,
                "trend": SignalTrend.FLAT,
            }
        )

    def test_correct(self):
        serializer = AnnotationResultAcousticFeaturesSerializer(
            self.instance,
            data={
                "start_frequency": 10,
                "end_frequency": 50,
                "min_frequency": 5,
                "max_frequency": 500,
                "median_frequency": 25,
                "beginning_sweep_slope": 25,
                "end_sweep_slope": 25,
                "steps_count": 2,
                "relative_peaks_count": 2,
                "has_harmonics": True,
                "harmonics_count": 3,
                "level_peak_frequency": 53,
                "duration": 53,
                "trend": "Modulated",
            },
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.check_correct(serializer.instance)

    def test_create_empty(self):
        serializer = AnnotationResultAcousticFeaturesSerializer(
            self.instance,
            data={
                "start_frequency": None,
                "end_frequency": None,
                "min_frequency": None,
                "max_frequency": None,
                "median_frequency": None,
                "beginning_sweep_slope": None,
                "end_sweep_slope": None,
                "steps_count": None,
                "relative_peaks_count": None,
                "has_harmonics": None,
                "harmonics_count": None,
                "level_peak_frequency": None,
                "duration": None,
                "trend": None,
            },
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.check_empty(serializer.instance)

    def test_create_invalid_negative_number(self):
        serializer = AnnotationResultAcousticFeaturesSerializer(
            self.instance,
            data={
                "start_frequency": -10,
                "end_frequency": -50,
                "min_frequency": -5,
                "max_frequency": -500,
                "median_frequency": -25,
                "beginning_sweep_slope": -25,
                "end_sweep_slope": -25,
                "steps_count": -2,
                "relative_peaks_count": -2,
                "has_harmonics": True,
                "harmonics_count": -3,
                "level_peak_frequency": -53,
                "duration": -53,
                "trend": "Modulated",
            },
        )
        serializer.is_valid(raise_exception=False)
        self.check_errors(serializer.errors)
