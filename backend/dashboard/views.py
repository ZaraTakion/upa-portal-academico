from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from academic.models import AcademicCalendar, Grade, StudentProfile, Subject
from notifications_app.models import Notification


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        student = StudentProfile.objects.filter(user=user).first()

        if not student:
            return Response(
                {"detail": "Perfil acadêmico não encontrado para este usuário."},
                status=404,
            )

        grades = Grade.objects.filter(student=student)
        subjects_count = Subject.objects.count()

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
            "student": {
                "id": student.id,
                "username": student.user.username,
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