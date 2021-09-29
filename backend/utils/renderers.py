"""
Custom DRF renderers
see https://www.django-rest-framework.org/api-guide/renderers/
"""

from rest_framework.renderers import BaseRenderer

class CSVRenderer(BaseRenderer):
    """Custom renderer for CSV files"""
    media_type = 'text/csv'

    def render(self, data, media_type=None, renderer_context=None):
        return '\n'.join([','.join(line) for line in data])
