"""
Custom DRF validators
see https://www.django-rest-framework.org/api-guide/serializers/#validators
"""

from rest_framework import serializers

def valid_model_ids(model):
    """
    Generates a validor for given model
    This validator will check if given ids correspond to the model
    """
    def validate(value):
        """Generated function that check if given ids (or single id) are valid for a specific model"""
        if not isinstance(value, list):
            value = [value]
        correct_vals = set(model.objects.filter(id__in=value).values_list('id', flat=True))
        bad_vals = set(value) - correct_vals
        if bad_vals:
            raise serializers.ValidationError(f"{bad_vals} not valid ids for {model}")

    return validate
