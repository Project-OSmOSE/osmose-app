"""Session model"""
from django.db import models


class Session(models.Model):
    """
    This table contains the AudioAnnotator sessions output linked to the annotation of a specific dataset file. There
    can be multiple AA sessions for an annotation_tasks, the result of the latest session should be equal to the
    dataset’s file annotation.
    """

    start = models.DateTimeField()
    end = models.DateTimeField()
    session_output = models.JSONField()
