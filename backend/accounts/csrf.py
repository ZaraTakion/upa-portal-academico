"""Bootstrap CSRF for credentialed JWT refresh/logout across frontend origins."""
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class CSRFTokenView(APIView):
    # An expired Bearer token must not block issuance of a fresh CSRF cookie.
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=inline_serializer(name="LegacyCsrfToken", fields={"csrf": serializers.CharField()}))
    def get(self, request):
        return Response({"csrf": get_token(request)})
