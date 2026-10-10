from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CsrfView,
    CurrentUserView,
    ManagedUserViewSet,
    PasswordResetConfirmView,
    PasswordResetRequestView,
)

router = DefaultRouter()
router.register("users", ManagedUserViewSet, basename="managed-users")

urlpatterns = [
    path("", include(router.urls)),
    path("csrf/", CsrfView.as_view(), name="csrf-token"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path(
        "reset-password/",
        PasswordResetRequestView.as_view(),
        name="reset-password-request",
    ),
    path(
        "reset-password/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="reset-password-confirm",
    ),
]
