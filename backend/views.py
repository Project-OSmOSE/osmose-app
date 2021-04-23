from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

@api_view(http_method_names=['GET'])
def testview(request):
    if request.user.is_authenticated:
        return Response("hello " + str(request.user.username))
    else:
        return Response("test")
