from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AcademicCalendarViewSet,
    ClassEnrollmentViewSet,
    ClassGroupViewSet,
    GradeViewSet,
    StudentProfileViewSet,
    SubjectViewSet,
    TeacherProfileViewSet,
)


router = DefaultRouter()
router.register("students", StudentProfileViewSet, basename="students")
router.register("teachers", TeacherProfileViewSet, basename="teachers")
router.register("subjects", SubjectViewSet, basename="subjects")
router.register("class-groups", ClassGroupViewSet, basename="class-groups")
router.register("class-enrollments", ClassEnrollmentViewSet, basename="class-enrollments")
router.register("grades", GradeViewSet, basename="grades")
router.register("calendar", AcademicCalendarViewSet, basename="calendar")

urlpatterns = [
    path("", include(router.urls)),
]