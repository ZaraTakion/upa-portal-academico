from datetime import timedelta

from django.contrib.auth.models import Group, User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from academic.models import (
    AcademicCalendar,
    ClassEnrollment,
    ClassGroup,
    Course,
    Grade,
    StudentProfile,
    Subject,
    TeacherProfile,
    WeeklySchedule,
)


class DashboardSummaryTests(TestCase):
    def setUp(self):
        self.professor_group, _ = Group.objects.get_or_create(name="Professor")
        self.student_user = User.objects.create_user(
            username="student", password="student-password"
        )
        self.teacher_user = User.objects.create_user(
            username="teacher", password="teacher-password"
        )
        self.teacher_user.groups.add(self.professor_group)
        self.course, _ = Course.objects.get_or_create(name="Sistemas para Internet")
        self.student = StudentProfile.objects.create(
            user=self.student_user,
            registration="S-301",
            course=self.course,
            semester=4,
        )
        self.other_student_user = User.objects.create_user(
            username="other-student", password="student-password"
        )
        self.other_student = StudentProfile.objects.create(
            user=self.other_student_user,
            registration="S-302",
            course=self.course,
            semester=1,
        )
        self.teacher = TeacherProfile.objects.create(
            user=self.teacher_user,
            employee_code="T-301",
            department="Tecnologia",
        )
        self.subject = Subject.objects.create(
            name="Banco de Dados",
            code="DB-301",
            workload=80,
            professor="Professor",
            period=4,
        )
        self.other_subject = Subject.objects.create(
            name="Desenvolvimento Web",
            code="WEB-301",
            workload=80,
            professor="Professor",
            period=4,
        )
        self.group = ClassGroup.objects.create(
            name="Turma A",
            subject=self.subject,
            teacher=self.teacher,
            semester="2026.2",
            year=2026,
        )
        self.other_group = ClassGroup.objects.create(
            name="Turma B",
            subject=self.other_subject,
            teacher=self.teacher,
            semester="2026.2",
            year=2026,
        )
        ClassEnrollment.objects.create(class_group=self.group, student=self.student)
        ClassEnrollment.objects.create(class_group=self.other_group, student=self.student)
        self.client = APIClient()

    def test_student_summary_ignores_missing_grades_and_unenrolled_schedules(self):
        Grade.objects.create(
            student=self.student,
            subject=self.subject,
            grade=8,
            absence=2,
        )
        Grade.objects.create(
            student=self.student,
            subject=self.other_subject,
            grade=None,
            absence=1,
        )
        rogue_user = User.objects.create_user(username="rogue")
        rogue_profile = StudentProfile.objects.create(
            user=rogue_user,
            registration="S-303",
            course=Course.objects.create(name="Outro curso"),
            semester=1,
        )
        Grade.objects.create(
            student=rogue_profile,
            subject=self.subject,
            grade=2,
        )
        WeeklySchedule.objects.create(
            class_group=self.group,
            subject=self.subject,
            teacher=self.teacher,
            weekday="monday",
            start_time="09:00",
            end_time="10:00",
            location="Sala 1",
        )
        WeeklySchedule.objects.create(
            class_group=self.other_group,
            subject=self.other_subject,
            teacher=self.teacher,
            weekday="friday",
            start_time="14:00",
            end_time="15:00",
            location="Sala 2",
        )
        outsider_group = ClassGroup.objects.create(
            name="Turma externa",
            subject=self.subject,
            teacher=self.teacher,
            semester="2026.2",
            year=2026,
        )
        WeeklySchedule.objects.create(
            class_group=outsider_group,
            subject=self.subject,
            teacher=self.teacher,
            weekday="tuesday",
            start_time="11:00",
            end_time="12:00",
        )

        today = timezone.localdate()
        AcademicCalendar.objects.create(
            title="Evento em andamento",
            description="Evento iniciado ontem.",
            event_type="event",
            start_date=today - timedelta(days=1),
            end_date=today + __import__("datetime").timedelta(days=1),
        )
        AcademicCalendar.objects.create(
            title="Evento expirado",
            description="Evento já expirado.",
            event_type="event",
            start_date=today - __import__("datetime").timedelta(days=4),
            end_date=today - __import__("datetime").timedelta(days=2),
            visible_until=today - __import__("datetime").timedelta(days=1),
        )

        self.client.force_authenticate(self.student_user)
        response = self.client.get(reverse("dashboard-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["average_grade"], 8.0)
        self.assertEqual(response.data["total_absences"], 3)
        self.assertEqual(response.data["total_subjects"], 2)
        self.assertEqual(
            [item["weekday"] for item in response.data["weekly_schedule"]],
            ["Segunda-feira", "Sexta-feira"],
        )
        self.assertEqual(
            [item["title"] for item in response.data["next_events"]],
            ["Evento em andamento"],
        )

    def test_student_without_enrollments_has_zero_subjects(self):
        self.client.force_authenticate(self.other_student_user)
        response = self.client.get(reverse("dashboard-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_subjects"], 0)

    def test_teacher_summary_counts_only_grades_for_enrolled_students(self):
        ClassEnrollment.objects.create(
            class_group=self.group, student=self.other_student
        )
        enrolled_grade = Grade.objects.create(
            student=self.student, subject=self.subject, grade=7
        )
        Grade.objects.create(
            student=self.other_student, subject=self.subject, grade=8
        )

        self.client.force_authenticate(self.teacher_user)
        response = self.client.get(reverse("dashboard-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["role"], "Professor")
        self.assertEqual(response.data["total_grades"], 2)
        self.assertEqual(response.data["class_groups"][0]["students_count"], 2)
        self.assertEqual(enrolled_grade.grade, 7)

    def test_admin_summary_is_available_to_staff(self):
        admin = User.objects.create_superuser(
            username="admin", password="admin-password", email="admin@example.test"
        )
        self.client.force_authenticate(admin)

        response = self.client.get(reverse("dashboard-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["role"], "Administrador")
        self.assertEqual(response.data["total_students"], 2)
