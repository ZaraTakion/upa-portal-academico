from django.urls import path

from .views import CurrentUserView, PasswordResetView


urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("reset-password/", PasswordResetView.as_view(), name="reset-password"),
]