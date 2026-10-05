from django.urls import path

from .views import (
    CurrentUserView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
)


urlpatterns = [
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
