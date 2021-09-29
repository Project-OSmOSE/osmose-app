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

from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.urlpatterns import format_suffix_patterns
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from backend.api.views import user_index
from backend.api.views import annotation_set_index, annotation_task_index, annotation_task_show, annotation_task_update, is_staff
from backend.api.views import DatasetViewSet, AnnotationCampaignViewSet


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'dataset', DatasetViewSet, basename='test_dataset')
router.register(r'annotation_campaign', AnnotationCampaignViewSet, basename='test_dataset')

# Backend urls are for admin & api documentation
backend_urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('schema', SpectacularAPIView.as_view(), name='schema'),
    path('swagger', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger')
]

# API urls are meant to be used by our React frontend
api_urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', user_index),
    path('user/is_staff', is_staff),
    path('annotation-set/', annotation_set_index),
    path('annotation-task/campaign/<int:campaign_id>', annotation_task_index),
    path('annotation-task/<int:task_id>', annotation_task_show),
    path('annotation-task/<int:task_id>/update-results', annotation_task_update),
    path('', include(router.urls)),
]

# All paths are prefixed with backend or api for easier proxy use
urlpatterns = [
    path('backend/', include(backend_urlpatterns)),
    path('api/', include(api_urlpatterns))
]
