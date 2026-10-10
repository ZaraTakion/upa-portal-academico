"""Keep derived grades correct for queryset and Django Admin bulk deletions."""
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import (
    AssessmentResult,
    AttendanceRecord,
    GradePolicy,
    refresh_grade_statuses,
    sync_assessment_grades,
    sync_grade_absences,
)


@receiver(post_delete, sender=AssessmentResult)
def result_deleted(sender, instance, using, **kwargs):
    sync_assessment_grades(instance.student_id, instance.assessment.class_group_id, using=using)


@receiver(post_delete, sender=AttendanceRecord)
def attendance_deleted(sender, instance, using, **kwargs):
    sync_grade_absences(instance.student_id, instance.class_group_id, using=using)


@receiver(post_delete, sender=GradePolicy)
def policy_deleted(sender, instance, using, **kwargs):
    refresh_grade_statuses(using=using)
