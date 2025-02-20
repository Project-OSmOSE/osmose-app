from typing import Optional

from django.core.handlers.wsgi import WSGIRequest
from django.http import Http404
from rest_framework_simplejwt.authentication import JWTAuthentication
from whitenoise.middleware import WhiteNoiseMiddleware

from backend.aplose.models import User


class StaticFilesMiddleware(WhiteNoiseMiddleware):
    def _get_user(self, request: WSGIRequest) -> Optional[User]:
        if not request.COOKIES or "token" not in request.COOKIES:
            return None
        token = request.COOKIES["token"]
        validated_token = JWTAuthentication().get_validated_token(token)
        return JWTAuthentication().get_user(validated_token)

    def __call__(self, request: WSGIRequest):
        user = self._get_user(request)
        if "datawork" in request.path:
            if not user or not user.is_active:
                raise Http404
        return super().__call__(request)
