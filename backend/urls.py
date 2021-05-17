"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]
"""

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.urlpatterns import format_suffix_patterns
from backend.api.views import dataset_index, user_index, annotation_campaign_show, annotation_campaign_index_create, annotation_campaign_report_show
from backend.api.views import annotation_set_index, annotation_task_index, annotation_task_show, annotation_task_update


# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'is_staff']

# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dataset/', dataset_index),
    path('api/user/', user_index),
    path('api/annotation-campaign/<int:campaign_id>', annotation_campaign_show),
    path('api/annotation-campaign/', annotation_campaign_index_create),
    path('api/annotation-campaign/<int:campaign_id>/report/', annotation_campaign_report_show),
    path('api/annotation-set/', annotation_set_index),
    path('api/annotation-task/campaign/<int:campaign_id>', annotation_task_index),
    path('api/annotation-task/<int:task_id>', annotation_task_show),
    path('api/annotation-task/<int:task_id>/update-results', annotation_task_update),
]
