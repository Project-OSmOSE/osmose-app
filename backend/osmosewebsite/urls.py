from rest_framework import routers
from backend.osmosewebsite.views import TeamMemberViewSet

# API urls are meant to be used by our React frontend
website_router = routers.DefaultRouter()
website_router.register(r"members", TeamMemberViewSet, basename="members")
