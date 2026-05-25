from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from academic.models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)
from management_app.models import FinancialInvoice
from notifications_app.models import Notification


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        groups = list(user.groups.values_list("name", flat=True))

        if user.is_staff or user.is_superuser:
            return self.admin_summary(user, groups)

        if "Professor" in groups:
            return self.teacher_summary(user, groups)

        return self.student_summary(user, groups)

    def student_summary(self, user, groups):
        student = StudentProfile.objects.filter(user=user).first()

        if not student:
            return Response(
                {"detail": "Perfil acadêmico não encontrado para este usuário."},
                status=404,
            )

        grades = Grade.objects.filter(student=student)
        enrollments = ClassEnrollment.objects.filter(student=student)
        today = timezone.localdate()

        if grades.exists():
            average_grade = sum(float(item.grade or 0) for item in grades) / grades.count()
            total_absences = sum(item.absence for item in grades)
        else:
            average_grade = 0
            total_absences = 0

        data = {
            "role": "Aluno",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.get_full_name() or user.username,
                "email": user.email,
                "groups": groups,
            },
            "student": {
                "id": student.id,
                "full_name": user.get_full_name() or user.username,
                "registration": student.registration,
                "course": student.course,
                "semester": student.semester,
                "phone": student.phone,
                "address": student.address,
            },
            "total_subjects": enrollments.count() or Subject.objects.count(),
            "average_grade": round(average_grade, 2),
            "total_absences": total_absences,
            "unread_notifications": Notification.objects.filter(user=user, is_read=False).count(),
            "pending_invoices": FinancialInvoice.objects.filter(user=user, status__in=["pending", "overdue"]).count(),
            "next_events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "event_type": event.event_type,
                    "event_type_display": event.get_event_type_display(),
                    "start_date": event.start_date,
                    "end_date": event.end_date,
                }
                for event in AcademicCalendar.objects.filter(start_date__gte=today).order_by("start_date")[:5]
            ],
            "weekly_schedule": [
                {
                    "id": item.id,
                    "subject": item.subject.name,
                    "weekday": item.get_weekday_display(),
                    "start_time": item.start_time,
                    "end_time": item.end_time,
                    "location": item.location,
                }
                for item in WeeklySchedule.objects.all().order_by("weekday", "start_time")[:8]
            ],
        }

        return Response(data)

    def teacher_summary(self, user, groups):
        teacher = TeacherProfile.objects.filter(user=user).first()

        if not teacher:
            return Response(
                {"detail": "Perfil de professor não encontrado para este usuário."},
                status=404,
            )

        class_groups = ClassGroup.objects.filter(teacher=teacher)

        data = {
            "role": "Professor",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.get_full_name() or user.username,
                "email": user.email,
                "groups": groups,
            },
            "teacher": {
                "id": teacher.id,
                "full_name": user.get_full_name() or user.username,
                "employee_code": teacher.employee_code,
                "department": teacher.department,
                "title": teacher.title,
            },
            "total_classes": class_groups.count(),
            "total_students": ClassEnrollment.objects.filter(class_group__teacher=teacher).values("student").distinct().count(),
            "total_grades": Grade.objects.filter(subject__classgroup__teacher=teacher).distinct().count(),
            "unread_notifications": Notification.objects.filter(user=user, is_read=False).count(),
            "class_groups": [
                {
                    "id": group.id,
                    "name": group.name,
                    "subject": group.subject.name,
                    "semester": group.semester,
                    "year": group.year,
                    "students_count": group.classenrollment_set.count(),
                }
                for group in class_groups
            ],
        }

        return Response(data)

    def admin_summary(self, user, groups):
        return Response(
            {
                "role": "Administrador",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.get_full_name() or user.username,
                    "email": user.email,
                    "groups": groups,
                },
                "total_students": StudentProfile.objects.count(),
                "total_teachers": TeacherProfile.objects.count(),
                "total_subjects": Subject.objects.count(),
                "total_class_groups": ClassGroup.objects.count(),
                "total_enrollments": ClassEnrollment.objects.count(),
                "total_notifications": Notification.objects.count(),
                "total_events": AcademicCalendar.objects.count(),
                "total_invoices": FinancialInvoice.objects.count(),
            }
        )