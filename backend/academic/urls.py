from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AcademicCalendarViewSet,
    AcademicTermViewSet,
    AssessmentResultViewSet,
    AssessmentViewSet,
    AttendanceRecordViewSet,
    ClassEnrollmentViewSet,
    ClassGroupViewSet,
    CourseViewSet,
    GradeViewSet,
    GradePolicyViewSet,
    StudentProfileViewSet,
    SubjectViewSet,
    TeacherProfileViewSet,
    WeeklyScheduleViewSet,
)


router = DefaultRouter()
router.register("grade-policy", GradePolicyViewSet, basename="grade-policy")
router.register("courses", CourseViewSet, basename="courses")
router.register("terms", AcademicTermViewSet, basename="terms")
router.register("assessments", AssessmentViewSet, basename="assessments")
router.register("assessment-results", AssessmentResultViewSet, basename="assessment-results")
router.register("attendance", AttendanceRecordViewSet, basename="attendance")
router.register("students", StudentProfileViewSet, basename="students")
router.register("teachers", TeacherProfileViewSet, basename="teachers")
router.register("subjects", SubjectViewSet, basename="subjects")
router.register("class-groups", ClassGroupViewSet, basename="class-groups")
router.register("class-enrollments", ClassEnrollmentViewSet, basename="class-enrollments")
router.register("grades", GradeViewSet, basename="grades")
router.register("calendar", AcademicCalendarViewSet, basename="calendar")
router.register("weekly-schedule", WeeklyScheduleViewSet, basename="weekly-schedule")

urlpatterns = [
    path("", include(router.urls)),
]