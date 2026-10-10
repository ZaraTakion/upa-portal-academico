from django.contrib import admin
from django.db import DatabaseError, connections
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.views import CookieTokenRefreshView, LoginTokenObtainPairView, LogoutView


def health_check(request):
    return JsonResponse({"status": "ok"})


def readiness_check(request):
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ready"})


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("health/ready/", readiness_check, name="readiness-check"),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(permission_classes=[IsAdminUser], authentication_classes=[JWTAuthentication, SessionAuthentication]), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema", permission_classes=[IsAdminUser], authentication_classes=[JWTAuthentication, SessionAuthentication]), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema", permission_classes=[IsAdminUser], authentication_classes=[JWTAuthentication, SessionAuthentication]), name="redoc"),
    path("api/token/", LoginTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/logout/", LogoutView.as_view(), name="token_logout"),
    path("api/accounts/", include("accounts.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/academic/", include("academic.urls")),
    path("api/", include("notifications_app.urls")),
    path("api/", include("management_app.urls")),
]
