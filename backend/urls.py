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

Also using DRF routers, see:
https://www.django-rest-framework.org/api-guide/routers/
"""

from django.contrib import admin
from django.urls import path, include

from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.urlpatterns import format_suffix_patterns
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from backend.api.views import DatasetViewSet, UserViewSet, AnnotationSetViewSet
from backend.api.views import AnnotationTaskViewSet, AnnotationCampaignViewSet

# Backend urls are for admin & api documentation
backend_urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('schema', SpectacularAPIView.as_view(), name='schema'),
    path('swagger', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger')
]

# API urls are meant to be used by our React frontend
api_router = routers.DefaultRouter()
api_router.register(r'dataset', DatasetViewSet, basename='dataset')
api_router.register(r'user', UserViewSet, basename='user')
api_router.register(r'annotation-set', AnnotationSetViewSet, basename='annotation-set')
api_router.register(r'annotation-campaign', AnnotationCampaignViewSet, basename='annotation-campaign')
api_router.register(r'annotation-task', AnnotationTaskViewSet, basename='annotation-task')
api_urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(api_router.urls)),
]

# All paths are prefixed with backend or api for easier proxy use
urlpatterns = [
    path('backend/', include(backend_urlpatterns)),
    path('api/', include(api_urlpatterns))
]
