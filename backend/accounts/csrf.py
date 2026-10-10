"""Bootstrap CSRF for credentialed JWT refresh/logout across frontend origins."""
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class CSRFTokenView(APIView):
    # An expired Bearer token must not block issuance of a fresh CSRF cookie.
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"csrf": get_token(request)})
