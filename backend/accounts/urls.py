from django.urls import path

from .views import PasswordResetView


urlpatterns = [
    path("reset-password/", PasswordResetView.as_view(), name="reset-password"),
]