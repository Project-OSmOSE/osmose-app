"""API tests"""
from .models import *
from .serializers import *
from .views import *

# TODO: add missing tests
#  - views
#      - annotation
#          - comment:list (default, for_current_user, archived campaign)
#          - campaign:create
#              - empty required label set (create)
#              - empty required label_set_labels (check)
#              - spectro config not belonging to dataset
#              - past deadline
#              - empty confidence_set_indicators (check)
#          - file range:post
#              - update range including finished task (400 invalid_update)
#          - result:import
#              - import with label unknown from label set
#              - import with confidence unknown from confidence set
#      - data
#          - export audio metadata
#          - export spectrogram configuration
#      - review tests for dataset
#          - list to import
