from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AcademicCalendarViewSet,
    GradeViewSet,
    StudentProfileViewSet,
    SubjectViewSet,
)


router = DefaultRouter()
router.register("students", StudentProfileViewSet, basename="students")
router.register("subjects", SubjectViewSet, basename="subjects")
router.register("grades", GradeViewSet, basename="grades")
router.register("calendar", AcademicCalendarViewSet, basename="calendar")

urlpatterns = [
    path("", include(router.urls)),
]