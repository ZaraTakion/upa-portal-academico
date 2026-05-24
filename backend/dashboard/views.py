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
)
from notifications_app.models import Notification


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        groups = list(user.groups.values_list("name", flat=True))

        if user.is_staff or user.is_superuser:
            return self.get_admin_summary(user, groups)

        if "Professor" in groups:
            return self.get_teacher_summary(user, groups)

        return self.get_student_summary(user, groups)

    def get_student_summary(self, user, groups):
        student = StudentProfile.objects.filter(user=user).first()

        if not student:
            return Response(
                {"detail": "Perfil acadêmico não encontrado para este usuário."},
                status=404,
            )

        grades = Grade.objects.filter(student=student)
        enrollments = ClassEnrollment.objects.filter(student=student)
        subjects_count = enrollments.count() or Subject.objects.count()

        if grades.exists():
            average_grade = sum(float(item.grade) for item in grades) / grades.count()
            total_absences = sum(item.absence for item in grades)
        else:
            average_grade = 0
            total_absences = 0

        unread_notifications = Notification.objects.filter(
            user=user,
            is_read=False,
        ).count()

        next_events = AcademicCalendar.objects.order_by("event_date")[:5]

        data = {
            "role": "Aluno",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "groups": groups,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            "student": {
                "id": student.id,
                "username": student.user.username,
                "full_name": student.user.get_full_name() or student.user.username,
                "email": student.user.email,
                "registration": student.registration,
                "course": student.course,
                "semester": student.semester,
            },
            "total_subjects": subjects_count,
            "average_grade": round(average_grade, 2),
            "total_absences": total_absences,
            "unread_notifications": unread_notifications,
            "next_events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "event_date": event.event_date,
                }
                for event in next_events
            ],
        }

        return Response(data)

    def get_teacher_summary(self, user, groups):
        teacher = TeacherProfile.objects.filter(user=user).first()

        if not teacher:
            return Response(
                {"detail": "Perfil de professor não encontrado para este usuário."},
                status=404,
            )

        class_groups = ClassGroup.objects.filter(teacher=teacher)
        enrollments = ClassEnrollment.objects.filter(class_group__teacher=teacher)
        students_count = enrollments.values("student").distinct().count()
        grades_count = Grade.objects.filter(
            subject__classgroup__teacher=teacher
        ).distinct().count()

        unread_notifications = Notification.objects.filter(
            user=user,
            is_read=False,
        ).count()

        next_events = AcademicCalendar.objects.order_by("event_date")[:5]

        data = {
            "role": "Professor",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "groups": groups,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            "teacher": {
                "id": teacher.id,
                "username": teacher.user.username,
                "full_name": teacher.user.get_full_name() or teacher.user.username,
                "email": teacher.user.email,
                "employee_code": teacher.employee_code,
                "department": teacher.department,
                "title": teacher.title,
            },
            "total_classes": class_groups.count(),
            "total_students": students_count,
            "total_grades": grades_count,
            "unread_notifications": unread_notifications,
            "next_events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "event_date": event.event_date,
                }
                for event in next_events
            ],
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

    def get_admin_summary(self, user, groups):
        data = {
            "role": "Administrador",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "groups": groups,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            "total_students": StudentProfile.objects.count(),
            "total_teachers": TeacherProfile.objects.count(),
            "total_subjects": Subject.objects.count(),
            "total_class_groups": ClassGroup.objects.count(),
            "total_enrollments": ClassEnrollment.objects.count(),
            "total_notifications": Notification.objects.count(),
            "total_events": AcademicCalendar.objects.count(),
        }

        return Response(data)