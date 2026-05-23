from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AcademicFileViewSet, ContactMessageViewSet


router = DefaultRouter()
router.register("contact", ContactMessageViewSet, basename="contact")
router.register("files", AcademicFileViewSet, basename="files")

urlpatterns = [
    path("", include(router.urls)),
]